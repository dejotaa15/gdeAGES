import { Injectable } from '@nestjs/common';
import { StatusCompra } from '../../../domain/enums/status-compra.enum';
import { paraReais } from '../../../domain/money';
import {
  FaturamentoPorProdutoDto,
  FaturamentoResponseDto,
  PeriodoQueryDto,
} from '../../dtos/compra.dto';
import { CompraService } from '../../services/compra.service';
import { converterPeriodo } from './periodo';

/**
 * "Listagem de faturamento" do briefing: soma as compras CONCLUÍDAS do
 * período (canceladas não contam) e quebra o total por produto.
 */
@Injectable()
export class ConsultarFaturamentoUseCase {
  constructor(private readonly compraService: CompraService) {}

  async executar(periodo: PeriodoQueryDto): Promise<FaturamentoResponseDto> {
    const compras = await this.compraService.listar({
      status: StatusCompra.CONCLUIDA,
      ...converterPeriodo(periodo),
    });

    const porProduto = new Map<
      number,
      { nomeProduto: string | null; quantidade: number; centavos: number }
    >();
    let totalCentavos = 0;
    let itensVendidos = 0;

    for (const compra of compras) {
      totalCentavos += compra.totalEmCentavos;
      itensVendidos += compra.quantidadeDeItens;

      for (const item of compra.itens) {
        const acumulado = porProduto.get(item.produtoId) ?? {
          nomeProduto: item.nomeProduto ?? null,
          quantidade: 0,
          centavos: 0,
        };
        acumulado.quantidade += item.quantidade;
        acumulado.centavos += item.subtotalEmCentavos;
        porProduto.set(item.produtoId, acumulado);
      }
    }

    const ranking: FaturamentoPorProdutoDto[] = [...porProduto.entries()]
      .map(([produtoId, v]) => ({
        produtoId,
        nomeProduto: v.nomeProduto,
        quantidadeVendida: v.quantidade,
        total: paraReais(v.centavos),
      }))
      .sort((a, b) => b.total - a.total);

    return {
      inicio: periodo.inicio ?? null,
      fim: periodo.fim ?? null,
      quantidadeDeCompras: compras.length,
      itensVendidos,
      total: paraReais(totalCentavos),
      ticketMedio: compras.length
        ? paraReais(Math.round(totalCentavos / compras.length))
        : 0,
      porProduto: ranking,
    };
  }
}
