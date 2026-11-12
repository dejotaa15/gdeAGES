import { Compra } from '../../domain/entities/compra.entity';
import { CompraResponseDto } from '../dtos/compra.dto';

export class CompraMapper {
  static toResponse(compra: Compra): CompraResponseDto {
    return {
      id: compra.id!,
      data: compra.data,
      status: compra.status,
      usuarioId: compra.usuarioId,
      itens: compra.itens.map((item) => ({
        produtoId: item.produtoId,
        nomeProduto: item.nomeProduto ?? null,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        subtotal: item.subtotal,
      })),
      total: compra.total,
    };
  }
}
