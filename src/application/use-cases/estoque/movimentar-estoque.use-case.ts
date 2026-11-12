import { Injectable } from '@nestjs/common';
import { Estoque } from '../../../domain/entities/estoque.entity';
import { EstoqueService } from '../../services/estoque.service';

export type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste';

/**
 * Entrada (reposição), saída (perda/vencimento) e ajuste (inventário).
 * A validação de cada movimento mora na entidade Estoque.
 */
@Injectable()
export class MovimentarEstoqueUseCase {
  constructor(private readonly estoqueService: EstoqueService) {}

  async executar(
    id: number,
    tipo: TipoMovimentacao,
    quantidade: number,
  ): Promise<Estoque> {
    const estoque = await this.estoqueService.buscarPorId(id);

    const movimentos: Record<TipoMovimentacao, (q: number) => void> = {
      entrada: (q) => estoque.registrarEntrada(q),
      saida: (q) => estoque.registrarSaida(q),
      ajuste: (q) => estoque.ajustar(q),
    };
    movimentos[tipo](quantidade);

    return this.estoqueService.salvar(estoque);
  }
}
