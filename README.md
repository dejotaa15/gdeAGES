# Gestão de Compras e Estoque — Panvel

API da trilha **GDE Back** (Preto no Branco): processa compras, atualiza
estoque e lista o faturamento da farmácia, com usuários autenticados e
permissões por cargo.

**Stack:** TypeScript · NestJS 11 · Prisma 7 · PostgreSQL (Supabase) · JWT

---

## Como rodar

```bash
npm install
cp .env.example .env          # preencha DATABASE_URL, DIRECT_URL, JWT_SECRET e ADMIN_*
npx prisma migrate dev        # aplica as migrations no banco
npx prisma db seed            # cria o primeiro ADMIN (usando ADMIN_EMAIL / ADMIN_SENHA)
npm run start:dev             # http://localhost:3000
```

Depois importe `postman/gdeAGES.postman_collection.json` no Postman e rode
**Auth → Login (admin)** primeiro: o token é salvo sozinho na variável
`{{token}}` e usado em todas as outras requisições.

### Testes

```bash
npm test             # unitários — rodam sem banco (repositórios em memória)
npm run test:e2e     # ponta a ponta — ⚠️ APAGA os dados do banco do .env, use um banco de teste
```

---

## Arquitetura (Clean Architecture + DDD)

```
src/
├── domain/                  ← regras de negócio puras (não conhece Nest nem Prisma)
│   ├── entities/            Produto, Estoque, Compra, ItemCompra, Usuario
│   ├── enums/               Cargo, StatusCompra
│   ├── exceptions/          EstoqueInsuficiente, RecursoNaoEncontrado...
│   └── money.ts             cálculos em centavos
├── application/             ← orquestra o domínio
│   ├── interfaces/          contratos: IProdutoRepository, IHashService, ITokenService...
│   ├── dtos/                entrada/saída da API (com validação)
│   ├── mappers/             Entity → DTO de resposta
│   ├── services/            acesso fino aos repositórios (CRUD)
│   └── use-cases/           regras que cruzam domínios (RegistrarCompra, Faturamento, Login...)
├── infrastructure/          ← detalhes técnicos que implementam os contratos
│   ├── database/            PrismaService + mappers Prisma ↔ Domain
│   ├── repositories/        PrismaProdutoRepository, PrismaCompraRepository...
│   └── security/            bcrypt (hash) e JWT (token)
├── presentation/            ← porta de entrada HTTP
│   ├── controllers/
│   ├── guards/              AuthGuard (autenticação) e RolesGuard (autorização)
│   ├── decorators/          @Public(), @Roles(), @UsuarioAtual()
│   └── filters/             traduz exceções de domínio em status HTTP
└── modules/                 ← composição: liga cada interface à sua implementação
```

**Fluxo de uma requisição:** `Controller → UseCase (se houver regra) → Service → Repository`.
CRUD simples (ex.: listar produtos) vai direto `Controller → Service`, o
"atalho" mostrado na aula de Clean (Teoria x Prática).

### Onde aparece cada princípio SOLID

| Princípio | Onde |
|---|---|
| **S**ingle Responsibility | Cada UseCase faz uma coisa (`RegistrarCompra`, `CancelarCompra`, `ConsultarFaturamento`). Mappers só convertem, guards só checam acesso. |
| **O**pen/Closed | `DomainExceptionFilter`: exceção nova = uma linha na tabela, sem mexer na lógica. |
| **L**iskov | Qualquer implementação de `IProdutoRepository` (Prisma ou em memória) funciona no `ProdutoService` — os testes provam isso. |
| **I**nterface Segregation | Um repositório por agregado; `IHashService` e `ITokenService` separados. |
| **D**ependency Inversion | Services dependem de interfaces (`@Inject(PRODUTO_REPOSITORY)`), nunca do Prisma. |

---

## Autenticação e autorização

- Login em `POST /auth/login` devolve um **JWT** (expira em `JWT_EXPIRES_IN`).
- Envie em todas as outras rotas: `Authorization: Bearer <token>`.
- O `AuthGuard` é **global**: toda rota exige token, exceto as marcadas com `@Public()`.
  Esquecer um decorator deixa a rota fechada, não aberta.
- O `RolesGuard` lê o cargo direto do JWT (sem ir ao banco).
- `401` = não sei quem você é · `403` = sei quem é, mas não pode.

| Ação | ATENDENTE | GERENTE | ADMIN |
|---|:-:|:-:|:-:|
| Consultar produtos / estoque / compras | ✅ | ✅ | ✅ |
| Registrar compra | ✅ | ✅ | ✅ |
| Cadastrar/alterar produtos e estoque | — | ✅ | ✅ |
| Cancelar compra · ver faturamento | — | ✅ | ✅ |
| Apagar compra cancelada | — | — | ✅ |
| Gerenciar usuários | — | — | ✅ |

---

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Login (público) |
| GET | `/auth/me` | Dados do usuário logado |
| POST · GET | `/usuarios` | Criar · listar |
| GET · PATCH · DELETE | `/usuarios/:id` | Buscar · atualizar · remover |
| POST · GET | `/produtos` | Criar · listar |
| GET · PUT · PATCH · DELETE | `/produtos/:id` | Buscar · substituir · atualizar · remover |
| POST · GET | `/estoque` | Criar estoque de um produto · listar |
| GET · PATCH · DELETE | `/estoque/:id` | Buscar · ajuste de inventário · remover |
| POST | `/estoque/:id/entrada` | Reposição (`{ "quantidade": 10 }`) |
| POST | `/estoque/:id/saida` | Perda/vencimento (`{ "quantidade": 2 }`) |
| POST | `/compras` | Registrar compra — baixa o estoque |
| GET | `/compras?status=&inicio=&fim=` | Listar com filtros |
| GET | `/compras/faturamento?inicio=2026-11-01&fim=2026-11-30` | Faturamento do período |
| GET | `/compras/:id` | Buscar |
| PATCH | `/compras/:id/cancelar` | Cancelar — devolve ao estoque |
| DELETE | `/compras/:id` | Apagar (só se já cancelada) |

Exemplo de compra:

```json
POST /compras
{ "itens": [ { "produtoId": 1, "quantidade": 2 }, { "produtoId": 3, "quantidade": 1 } ] }
```

---

## Regras de negócio e decisões

- **O cliente não manda preço.** O backend copia o preço atual do produto para o
  item da compra (`precoUnitario`). Se o preço mudar depois, o faturamento antigo não muda.
- **Estoque nunca fica negativo**, nem com vendas simultâneas: a baixa é feita em
  transação com `UPDATE ... WHERE quantidadeAtual >= quantidade`. Se outra venda
  levou o estoque antes, nada é gravado.
- **Compra + baixa de estoque são atômicas** (tudo ou nada).
- **Cancelar ≠ apagar.** Cancelar devolve os itens ao estoque e tira do faturamento;
  só compras canceladas podem ser apagadas.
- **Produto com histórico de compras não pode ser removido.**
- **Dinheiro em `Decimal` no banco e em centavos nos cálculos** (`0.1 + 0.2` em float dá `0.30000000000000004`).
- **Senhas com bcrypt**; a resposta da API nunca devolve o hash.
- **Login com mensagem genérica** ("e-mail ou senha inválidos"), para não revelar quais e-mails existem.
