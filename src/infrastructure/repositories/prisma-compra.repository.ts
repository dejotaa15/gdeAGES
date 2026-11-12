import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Compra } from '../../domain/entities/compra.entity';
import { StatusCompra } from '../../domain/enums/status-compra.enum';
import {
  EstoqueInsuficienteException,
  RegraDeNegocioException,
} from '../../domain/exceptions/domain.exceptions';
import {
  FiltroCompras,
  ICompraRepository,
} from '../../application/interfaces/compra.repository';
import { PrismaService } from '../database/prisma.service';
import { CompraPrismaMapper } from '../database/prisma.mappers';

const INCLUIR_ITENS = {
  itens: { include: { produto: true }, orderBy: { id: 'asc' } },
} satisfies Prisma.CompraInclude;

@Injectable()
export class PrismaCompraRepository implements ICompraRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Transação: ou a compra é salva E o estoque é baixado, ou nada acontece.
   *
   * O "updateMany com quantidadeAtual >= quantidade" é o truque contra
   * condição de corrida: o banco só decrementa se ainda houver saldo no
   * instante da escrita. Se count === 0, outra venda levou o estoque antes.
   */
  async registrar(compra: Compra): Promise<Compra> {
    const criada = await this.prisma.$transaction(async (tx) => {
      for (const item of compra.itens) {
        const { count } = await tx.estoque.updateMany({
          where: {
            produtoId: item.produtoId,
            quantidadeAtual: { gte: item.quantidade },
          },
          data: { quantidadeAtual: { decrement: item.quantidade } },
        });
        if (count === 0) {
          throw new EstoqueInsuficienteException(item.produtoId);
        }
      }

      return tx.compra.create({
        data: {
          data: compra.data,
          status: compra.status,
          usuarioId: compra.usuarioId,
          itens: {
            create: compra.itens.map((item) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
            })),
          },
        },
        include: INCLUIR_ITENS,
      });
    });

    return CompraPrismaMapper.toDomain(criada);
  }

  async cancelar(compra: Compra): Promise<Compra> {
    const cancelada = await this.prisma.$transaction(async (tx) => {
      // Só muda se ainda estiver CONCLUIDA: dois cancelamentos ao mesmo
      // tempo não devolvem o estoque duas vezes.
      const { count } = await tx.compra.updateMany({
        where: { id: compra.id, status: StatusCompra.CONCLUIDA },
        data: { status: StatusCompra.CANCELADA },
      });
      if (count === 0) {
        throw new RegraDeNegocioException(
          `A compra ${compra.id} já está cancelada`,
        );
      }

      for (const item of compra.itens) {
        await tx.estoque.upsert({
          where: { produtoId: item.produtoId },
          update: { quantidadeAtual: { increment: item.quantidade } },
          create: {
            produtoId: item.produtoId,
            quantidadeAtual: item.quantidade,
          },
        });
      }

      return tx.compra.findUniqueOrThrow({
        where: { id: compra.id },
        include: INCLUIR_ITENS,
      });
    });

    return CompraPrismaMapper.toDomain(cancelada);
  }

  async listar(filtro: FiltroCompras = {}): Promise<Compra[]> {
    const compras = await this.prisma.compra.findMany({
      where: {
        status: filtro.status,
        data: { gte: filtro.inicio, lt: filtro.fim },
      },
      include: INCLUIR_ITENS,
      orderBy: { data: 'desc' },
    });
    return compras.map(CompraPrismaMapper.toDomain);
  }

  async buscarPorId(id: number): Promise<Compra | null> {
    const compra = await this.prisma.compra.findUnique({
      where: { id },
      include: INCLUIR_ITENS,
    });
    return compra ? CompraPrismaMapper.toDomain(compra) : null;
  }

  async remover(id: number): Promise<void> {
    await this.prisma.compra.delete({ where: { id } });
  }
}
