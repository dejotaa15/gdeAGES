import { StatusCompra } from '../enums/status-compra.enum';
import { RegraDeNegocioException } from '../exceptions/domain.exceptions';
import { paraReais } from '../money';
import { ItemCompra, ItemCompraProps } from './item-compra.entity';

export interface CompraProps {
  id?: number;
  data?: Date;
  status?: StatusCompra;
  usuarioId?: string | null;
  itens: ItemCompra[];
}

/**
 * Uma compra feita no balcão da farmácia. É ela que baixa o estoque e
 * entra no faturamento.
 */
export class Compra {
  readonly id?: number;
  readonly data: Date;
  readonly usuarioId: string | null;
  readonly itens: ItemCompra[];
  private _status: StatusCompra;

  constructor(props: CompraProps) {
    this.id = props.id;
    this.data = props.data ?? new Date();
    this._status = props.status ?? StatusCompra.CONCLUIDA;
    this.usuarioId = props.usuarioId ?? null;
    this.itens = props.itens;
  }

  /**
   * Cria uma nova compra. Itens repetidos do mesmo produto são somados
   * em um só (pedir 2 + 3 dipironas é o mesmo que pedir 5).
   */
  static registrar(
    usuarioId: string,
    itens: Omit<ItemCompraProps, 'id'>[],
  ): Compra {
    if (!itens.length) {
      throw new RegraDeNegocioException(
        'A compra precisa ter pelo menos um item',
      );
    }

    const agrupados = new Map<number, Omit<ItemCompraProps, 'id'>>();
    for (const item of itens) {
      const existente = agrupados.get(item.produtoId);
      agrupados.set(item.produtoId, {
        ...item,
        quantidade: (existente?.quantidade ?? 0) + item.quantidade,
      });
    }

    return new Compra({
      usuarioId,
      itens: [...agrupados.values()].map((item) => new ItemCompra(item)),
    });
  }

  get status(): StatusCompra {
    return this._status;
  }

  get estaConcluida(): boolean {
    return this._status === StatusCompra.CONCLUIDA;
  }

  get totalEmCentavos(): number {
    return this.itens.reduce((soma, item) => soma + item.subtotalEmCentavos, 0);
  }

  get total(): number {
    return paraReais(this.totalEmCentavos);
  }

  get quantidadeDeItens(): number {
    return this.itens.reduce((soma, item) => soma + item.quantidade, 0);
  }

  cancelar(): void {
    if (this._status === StatusCompra.CANCELADA) {
      throw new RegraDeNegocioException(
        `A compra ${this.id} já está cancelada`,
      );
    }
    this._status = StatusCompra.CANCELADA;
  }

  /** Só compras canceladas podem ser apagadas — senão o faturamento "some". */
  garantirQuePodeSerRemovida(): void {
    if (this.estaConcluida) {
      throw new RegraDeNegocioException(
        'Compras concluídas não podem ser removidas. Cancele a compra primeiro.',
      );
    }
  }
}
