import { Injectable } from '@nestjs/common';
import { Produto } from '../../domain/entities/produto.entity';
import { IProdutoRepository } from '../../application/interfaces/produto.repository';
import { PrismaService } from '../database/prisma.service';
import { ProdutoPrismaMapper } from '../database/prisma.mappers';

@Injectable()
export class PrismaProdutoRepository implements IProdutoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(produto: Produto): Promise<Produto> {
    const criado = await this.prisma.produto.create({
      data: { nome: produto.nome, preco: produto.preco },
    });
    return ProdutoPrismaMapper.toDomain(criado);
  }

  async listar(): Promise<Produto[]> {
    const produtos = await this.prisma.produto.findMany({
      orderBy: { id: 'asc' },
    });
    return produtos.map(ProdutoPrismaMapper.toDomain);
  }

  async buscarPorId(id: number): Promise<Produto | null> {
    const produto = await this.prisma.produto.findUnique({ where: { id } });
    return produto ? ProdutoPrismaMapper.toDomain(produto) : null;
  }

  async buscarPorIds(ids: number[]): Promise<Produto[]> {
    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: ids } },
    });
    return produtos.map(ProdutoPrismaMapper.toDomain);
  }

  async salvar(produto: Produto): Promise<Produto> {
    const salvo = await this.prisma.produto.update({
      where: { id: produto.id },
      data: { nome: produto.nome, preco: produto.preco },
    });
    return ProdutoPrismaMapper.toDomain(salvo);
  }

  async remover(id: number): Promise<void> {
    await this.prisma.produto.delete({ where: { id } });
  }

  async possuiCompras(id: number): Promise<boolean> {
    const total = await this.prisma.itemCompra.count({
      where: { produtoId: id },
    });
    return total > 0;
  }
}
