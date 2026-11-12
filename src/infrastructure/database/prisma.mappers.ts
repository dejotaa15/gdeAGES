import {
  Compra as CompraModel,
  Estoque as EstoqueModel,
  ItemCompra as ItemCompraModel,
  Prisma,
  Produto as ProdutoModel,
  User as UserModel,
} from '@prisma/client';
import { Compra } from '../../domain/entities/compra.entity';
import { Estoque } from '../../domain/entities/estoque.entity';
import { ItemCompra } from '../../domain/entities/item-compra.entity';
import { Produto } from '../../domain/entities/produto.entity';
import { Usuario } from '../../domain/entities/usuario.entity';
import { Cargo } from '../../domain/enums/cargo.enum';
import { StatusCompra } from '../../domain/enums/status-compra.enum';

/**
 * Data Mappers entre o formato do banco (Prisma) e as entidades de domínio.
 * O domínio nunca vê um tipo do Prisma (como Prisma.Decimal).
 */
const decimalParaNumero = (valor: Prisma.Decimal): number => valor.toNumber();

export const ProdutoPrismaMapper = {
  toDomain: (m: ProdutoModel) =>
    new Produto({ id: m.id, nome: m.nome, preco: decimalParaNumero(m.preco) }),
};

export const EstoquePrismaMapper = {
  toDomain: (m: EstoqueModel) =>
    new Estoque({
      id: m.id,
      produtoId: m.produtoId,
      quantidadeAtual: m.quantidadeAtual,
      ultimaAtualizacao: m.ultimaAtualizacao,
    }),
};

export type CompraComItens = CompraModel & {
  itens: (ItemCompraModel & { produto?: ProdutoModel })[];
};

export const CompraPrismaMapper = {
  toDomain: (m: CompraComItens) =>
    new Compra({
      id: m.id,
      data: m.data,
      status: m.status as StatusCompra,
      usuarioId: m.usuarioId,
      itens: m.itens.map(
        (i) =>
          new ItemCompra({
            id: i.id,
            produtoId: i.produtoId,
            quantidade: i.quantidade,
            precoUnitario: decimalParaNumero(i.precoUnitario),
            nomeProduto: i.produto?.nome,
          }),
      ),
    }),
};

export const UsuarioPrismaMapper = {
  toDomain: (m: UserModel) =>
    new Usuario({
      id: m.id,
      nome: m.name,
      email: m.email,
      senhaHash: m.senha,
      cargo: m.cargo as Cargo,
      criadoEm: m.createdAt,
    }),
};
