import { RegraDeNegocioException } from '../exceptions/domain.exceptions';
import { paraCentavos, paraReais } from '../money';

export interface ItemCompraProps {
  id?: number;
  produtoId: number;
  quantidade: number;
  /**
   * Preço do produto NO MOMENTO da compra. Se o preço do produto mudar
   * amanhã, o faturamento de hoje não pode mudar junto.
   */
  precoUnitario: number;
  /** Só leitura: preenchido pelo repositório para facilitar respostas. */
  nomeProduto?: string;
}

export class ItemCompra {
  readonly id?: number;
  readonly produtoId: number;
  readonly quantidade: number;
  readonly precoUnitario: number;
  readonly nomeProduto?: string;

  constructor(props: ItemCompraProps) {
    if (!Number.isInteger(props.quantidade) || props.quantidade <= 0) {
      throw new RegraDeNegocioException(
        'A quantidade de cada item deve ser um inteiro maior que zero',
      );
    }
    this.id = props.id;
    this.produtoId = props.produtoId;
    this.quantidade = props.quantidade;
    this.precoUnitario = props.precoUnitario;
    this.nomeProduto = props.nomeProduto;
  }

  get subtotalEmCentavos(): number {
    return paraCentavos(this.precoUnitario) * this.quantidade;
  }

  get subtotal(): number {
    return paraReais(this.subtotalEmCentavos);
  }
}
