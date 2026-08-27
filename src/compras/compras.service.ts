import { Injectable } from '@nestjs/common';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { Compra } from './entities/compra.entity';

@Injectable()
export class ComprasService {
  private compras: Compra[] = [];

  create(createCompraDto: CreateCompraDto) {
    const novaCompra: Compra = {
      id: Date.now(),
      ...createCompraDto,
    };

    this.compras.push(novaCompra);

    return novaCompra;
  }

  findAll() {
    return this.compras;
  }

  findOne(id: number) {
    return this.compras.find((compra) => compra.id === id);
  }

  update(id: number, updateCompraDto: UpdateCompraDto) {
    const index = this.compras.findIndex((compra) => compra.id === id);

    if (index === -1) {
      return null;
    }

    this.compras[index] = {
      ...this.compras[index],
      ...updateCompraDto,
    };

    return this.compras[index];
  }

  remove(id: number) {
    const compraExiste = this.compras.some((compra) => compra.id === id);

    if (!compraExiste) {
      return null;
    }

    this.compras = this.compras.filter((compra) => compra.id !== id);

    return { removido: true };
  }
}