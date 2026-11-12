import { Estoque } from '../../domain/entities/estoque.entity';
import { EstoqueResponseDto } from '../dtos/estoque.dto';

export class EstoqueMapper {
  static toResponse(estoque: Estoque): EstoqueResponseDto {
    return {
      id: estoque.id!,
      produtoId: estoque.produtoId,
      quantidadeAtual: estoque.quantidadeAtual,
      ultimaAtualizacao: estoque.ultimaAtualizacao,
    };
  }
}
