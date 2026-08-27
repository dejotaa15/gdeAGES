import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';

@Injectable()
export class ComprasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompraDto: CreateCompraDto) {
    return this.prisma.compra.create({
      data: createCompraDto,
    });
  }

  async findAll() {
    return this.prisma.compra.findMany();
  }

  async findOne(id: number) {
    const compra = await this.prisma.compra.findUnique({
      where: {
        id,
      },
    });

    if (!compra) {
      throw new NotFoundException(`Compra ${id} não encontrada`);
    }

    return compra;
  }

  async update(id: number, updateCompraDto: UpdateCompraDto) {
    await this.findOne(id);

    return this.prisma.compra.update({
      where: {
        id,
      },
      data: updateCompraDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.compra.delete({
      where: {
        id,
      },
    });
  }
}