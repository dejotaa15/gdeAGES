import { Injectable } from '@nestjs/common';
import { Estoque } from '../../domain/entities/estoque.entity';
import { IEstoqueRepository } from '../../application/interfaces/estoque.repository';
import { PrismaService } from '../database/prisma.service';
import { EstoquePrismaMapper } from '../database/prisma.mappers';

@Injectable()
export class PrismaEstoqueRepository implements IEstoqueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(estoque: Estoque): Promise<Estoque> {
    const criado = await this.prisma.estoque.create({
      data: {
        produtoId: estoque.produtoId,
        quantidadeAtual: estoque.quantidadeAtual,
      },
    });
    return EstoquePrismaMapper.toDomain(criado);
  }

  async listar(): Promise<Estoque[]> {
    const estoques = await this.prisma.estoque.findMany({
      orderBy: { id: 'asc' },
    });
    return estoques.map(EstoquePrismaMapper.toDomain);
  }

  async buscarPorId(id: number): Promise<Estoque | null> {
    const estoque = await this.prisma.estoque.findUnique({ where: { id } });
    return estoque ? EstoquePrismaMapper.toDomain(estoque) : null;
  }

  async buscarPorProdutoId(produtoId: number): Promise<Estoque | null> {
    const estoque = await this.prisma.estoque.findUnique({
      where: { produtoId },
    });
    return estoque ? EstoquePrismaMapper.toDomain(estoque) : null;
  }

  async buscarPorProdutoIds(produtoIds: number[]): Promise<Estoque[]> {
    const estoques = await this.prisma.estoque.findMany({
      where: { produtoId: { in: produtoIds } },
    });
    return estoques.map(EstoquePrismaMapper.toDomain);
  }

  async salvar(estoque: Estoque): Promise<Estoque> {
    const salvo = await this.prisma.estoque.update({
      where: { id: estoque.id },
      data: { quantidadeAtual: estoque.quantidadeAtual },
    });
    return EstoquePrismaMapper.toDomain(salvo);
  }

  async remover(id: number): Promise<void> {
    await this.prisma.estoque.delete({ where: { id } });
  }
}
