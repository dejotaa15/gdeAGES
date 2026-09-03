
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstoqueDto } from './dto/create-estoque.dto';
import { UpdateEstoqueDto } from './dto/update-estoque.dto';

@Injectable()
export class EstoqueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEstoqueDto: CreateEstoqueDto) {
    const produto = await this.prisma.produto.findUnique({
      where: {
        id: createEstoqueDto.produtoId,
      },
    });

    if (!produto) {
      throw new NotFoundException(
        `Produto ${createEstoqueDto.produtoId} não encontrado`,
      );
    }

    return this.prisma.estoque.create({
      data: createEstoqueDto,
      include: {
        produto: true,
      },
    });
  }

  async findAll() {
    return this.prisma.estoque.findMany({
      include: {
        produto: true,
      },
    });
  }

  async findOne(id: number) {
    const estoque = await this.prisma.estoque.findUnique({
      where: { id },
      include: {
        produto: true,
      },
    });

    if (!estoque) {
      throw new NotFoundException(`Estoque ${id} não encontrado`);
    }

    return estoque;
  }

  async update(id: number, updateEstoqueDto: UpdateEstoqueDto) {
    await this.findOne(id);

    if (updateEstoqueDto.produtoId !== undefined) {
      const produto = await this.prisma.produto.findUnique({
        where: {
          id: updateEstoqueDto.produtoId,
        },
      });

      if (!produto) {
        throw new NotFoundException(
          `Produto ${updateEstoqueDto.produtoId} não encontrado`,
        );
      }
    }

    return this.prisma.estoque.update({
      where: { id },
      data: updateEstoqueDto,
      include: {
        produto: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.estoque.delete({
      where: { id },
      include: {
        produto: true,
      },
    });
  }
}
```
