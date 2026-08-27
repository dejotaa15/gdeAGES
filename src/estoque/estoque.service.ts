import { Injectable } from '@nestjs/common';
import { CreateEstoqueDto } from './dto/create-estoque.dto';
import { UpdateEstoqueDto } from './dto/update-estoque.dto';
import { Estoque } from './entities/estoque.entity';

@Injectable()
export class EstoqueService {
  private estoques: Estoque[] = [];

  create(createEstoqueDto: CreateEstoqueDto) {
    const novoEstoque: Estoque = {
      id: Date.now(),
      ...createEstoqueDto,
    };

    this.estoques.push(novoEstoque);

    return novoEstoque;
  }

  findAll() {
    return this.estoques;
  }

  findOne(id: number) {
    return this.estoques.find((estoque) => estoque.id === id);
  }

  update(id: number, updateEstoqueDto: UpdateEstoqueDto) {
    const index = this.estoques.findIndex((estoque) => estoque.id === id);

    if (index === -1) {
      return null;
    }

    this.estoques[index] = {
      ...this.estoques[index],
      ...updateEstoqueDto,
    };

    return this.estoques[index];
  }

  remove(id: number) {
    const estoqueExiste = this.estoques.some((estoque) => estoque.id === id);

    if (!estoqueExiste) {
      return null;
    }

    this.estoques = this.estoques.filter((estoque) => estoque.id !== id);

    return { removido: true };
  }
}