import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstoqueDto } from './dto/create-estoque.dto';
import { UpdateEstoqueDto } from './dto/update-estoque.dto';

@Injectable()
export class EstoqueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEstoqueDto: CreateEstoqueDto) {
    return this.prisma.estoque.create({ data: createEstoqueDto });
  }

  async findAll() {
    return this.prisma.estoque.findMany();
  }

  async findOne(id: number) {
    const estoque = await this.prisma.estoque.findUnique({ where: { id } });
    if (!estoque) {
      throw new NotFoundException(`Estoque ${id} não encontrado`);
    }
    return estoque;
  }

  async update(id: number, updateEstoqueDto: UpdateEstoqueDto) {
    await this.findOne(id);
    return this.prisma.estoque.update({ where: { id }, data: updateEstoqueDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.estoque.delete({ where: { id } });
  }
}