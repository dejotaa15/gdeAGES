/**
 * Teste ponta a ponta: sobe a API inteira e conversa com um Postgres REAL.
 *
 * ATENÇÃO: este teste APAGA todos os dados do banco apontado por
 * DATABASE_URL. Use um banco separado para testes, nunca o de produção.
 */
import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

describe('API Gestão de Compras e Estoque Panvel (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let tokenAdmin: string;
  let tokenAtendente: string;
  let produtoId: number;
  let estoqueId: number;
  let compraId: number;

  const http = () => request(app.getHttpServer());
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = modulo.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.itemCompra.deleteMany();
    await prisma.compra.deleteMany();
    await prisma.estoque.deleteMany();
    await prisma.produto.deleteMany();
    await prisma.user.deleteMany();
    await prisma.user.create({
      data: {
        email: 'admin@teste.com',
        name: 'Admin',
        senha: await bcrypt.hash('admin123', 4),
        cargo: 'ADMIN',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('bloqueia rotas sem token (401)', () =>
    http().get('/produtos').expect(401));

  it('faz login do admin', async () => {
    const res = await http()
      .post('/auth/login')
      .send({ email: 'admin@teste.com', senha: 'admin123' })
      .expect(200);
    tokenAdmin = res.body.accessToken;
    expect(res.body.usuario).not.toHaveProperty('senha');
  });

  it('admin cria uma atendente, que faz login', async () => {
    await http()
      .post('/usuarios')
      .set(auth(tokenAdmin))
      .send({ nome: 'Ana', email: 'ana@teste.com', senha: 'ana12345' })
      .expect(201);

    const res = await http()
      .post('/auth/login')
      .send({ email: 'ana@teste.com', senha: 'ana12345' })
      .expect(200);
    tokenAtendente = res.body.accessToken;
    expect(res.body.usuario.cargo).toBe('ATENDENTE');
  });

  it('atendente não cria produto (403)', () =>
    http()
      .post('/produtos')
      .set(auth(tokenAtendente))
      .send({ nome: 'X', preco: 1 })
      .expect(403));

  it('valida o corpo da requisição (400)', () =>
    http()
      .post('/produtos')
      .set(auth(tokenAdmin))
      .send({ nome: '', preco: -5 })
      .expect(400));

  it('admin cadastra produto e estoque', async () => {
    const produto = await http()
      .post('/produtos')
      .set(auth(tokenAdmin))
      .send({ nome: 'Dipirona 500mg', preco: 9.9 })
      .expect(201);
    produtoId = produto.body.id;

    const estoque = await http()
      .post('/estoque')
      .set(auth(tokenAdmin))
      .send({ produtoId, quantidadeAtual: 5 })
      .expect(201);
    estoqueId = estoque.body.id;
  });

  it('atendente registra compra e o estoque baixa', async () => {
    const res = await http()
      .post('/compras')
      .set(auth(tokenAtendente))
      .send({ itens: [{ produtoId, quantidade: 3 }] })
      .expect(201);
    compraId = res.body.id;
    expect(res.body.total).toBe(29.7);

    const estoque = await http()
      .get(`/estoque/${estoqueId}`)
      .set(auth(tokenAtendente))
      .expect(200);
    expect(estoque.body.quantidadeAtual).toBe(2);
  });

  it('recusa compra sem estoque suficiente (422)', () =>
    http()
      .post('/compras')
      .set(auth(tokenAtendente))
      .send({ itens: [{ produtoId, quantidade: 10 }] })
      .expect(422));

  it('faturamento é só para ADMIN/GERENTE', async () => {
    await http()
      .get('/compras/faturamento')
      .set(auth(tokenAtendente))
      .expect(403);

    const res = await http()
      .get('/compras/faturamento')
      .set(auth(tokenAdmin))
      .expect(200);
    expect(res.body.total).toBe(29.7);
  });

  it('cancelar devolve o estoque e tira do faturamento', async () => {
    await http()
      .patch(`/compras/${compraId}/cancelar`)
      .set(auth(tokenAdmin))
      .expect(200);

    const estoque = await http()
      .get(`/estoque/${estoqueId}`)
      .set(auth(tokenAdmin))
      .expect(200);
    expect(estoque.body.quantidadeAtual).toBe(5);

    const faturamento = await http()
      .get('/compras/faturamento')
      .set(auth(tokenAdmin))
      .expect(200);
    expect(faturamento.body.total).toBe(0);
  });

  it('vendas simultâneas nunca deixam o estoque negativo', async () => {
    const respostas = await Promise.all(
      Array.from({ length: 8 }, () =>
        http()
          .post('/compras')
          .set(auth(tokenAtendente))
          .send({ itens: [{ produtoId, quantidade: 1 }] }),
      ),
    );
    const aprovadas = respostas.filter((r) => r.status === 201).length;
    expect(aprovadas).toBe(5);

    const estoque = await prisma.estoque.findUniqueOrThrow({
      where: { id: estoqueId },
    });
    expect(estoque.quantidadeAtual).toBe(0);
  });
});
