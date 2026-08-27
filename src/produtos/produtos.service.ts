import { Injectable } from '@nestjs/common';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Produto } from './entities/produto.entity';

@Injectable()
export class ProdutosService {
  private produtos: Produto[] = [];

  create(createProdutoDto: CreateProdutoDto) {
    const novoProduto: Produto = {
      id: Date.now(),
      ...createProdutoDto,
    };

    this.produtos.push(novoProduto);

    return novoProduto;
  }

  findAll() {
    return this.produtos;
  }

  findOne(id: number) {
    return this.produtos.find((produto) => produto.id === id);
  }

  update(id: number, updateProdutoDto: UpdateProdutoDto) {
    const index = this.produtos.findIndex((produto) => produto.id === id);

    if (index === -1) {
      return null;
    }

    this.produtos[index] = {
      ...this.produtos[index],
      ...updateProdutoDto,
    };

    return this.produtos[index];
  }

  remove(id: number) {
    const produtoExiste = this.produtos.some((produto) => produto.id === id);

    if (!produtoExiste) {
      return null;
    }

    this.produtos = this.produtos.filter((produto) => produto.id !== id);

    return { removido: true };
  }
}