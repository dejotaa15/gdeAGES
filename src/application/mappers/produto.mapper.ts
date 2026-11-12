import { Produto } from '../../domain/entities/produto.entity';
import { ProdutoResponseDto } from '../dtos/produto.dto';

export class ProdutoMapper {
  static toResponse(produto: Produto): ProdutoResponseDto {
    return {
      id: produto.id!,
      nome: produto.nome,
      preco: produto.preco,
    };
  }
}
