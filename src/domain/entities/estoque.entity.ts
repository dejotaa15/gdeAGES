import {
  EstoqueInsuficienteException,
  RegraDeNegocioException,
} from '../exceptions/domain.exceptions';

export interface EstoqueProps {
  id?: number;
  produtoId: number;
  quantidadeAtual: number;
  ultimaAtualizacao?: Date;
}

/**
 * O estoque de um produto. A regra central é: a quantidade nunca fica
 * negativa. Toda movimentação passa por métodos da própria entidade.
 */
export class Estoque {
  readonly id?: number;
  readonly produtoId: number;
  private _quantidadeAtual: number;
  private _ultimaAtualizacao?: Date;

  constructor(props: EstoqueProps) {
    this.id = props.id;
    this.produtoId = props.produtoId;
    this._quantidadeAtual = Estoque.validarQuantidade(props.quantidadeAtual);
    this._ultimaAtualizacao = props.ultimaAtualizacao;
  }

  get quantidadeAtual(): number {
    return this._quantidadeAtual;
  }

  get ultimaAtualizacao(): Date | undefined {
    return this._ultimaAtualizacao;
  }

  /** Chegada de mercadoria (reposição de fornecedor). */
  registrarEntrada(quantidade: number): void {
    Estoque.validarMovimentacao(quantidade);
    this._quantidadeAtual += quantidade;
  }

  /** Saída manual (perda, vencimento, avaria). */
  registrarSaida(quantidade: number): void {
    Estoque.validarMovimentacao(quantidade);
    if (!this.possui(quantidade)) {
      throw new EstoqueInsuficienteException(
        this.produtoId,
        this._quantidadeAtual,
        quantidade,
      );
    }
    this._quantidadeAtual -= quantidade;
  }

  /** Ajuste de inventário: define a quantidade contada fisicamente. */
  ajustar(novaQuantidade: number): void {
    this._quantidadeAtual = Estoque.validarQuantidade(novaQuantidade);
  }

  possui(quantidade: number): boolean {
    return this._quantidadeAtual >= quantidade;
  }

  private static validarQuantidade(quantidade: number): number {
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      throw new RegraDeNegocioException(
        'A quantidade em estoque deve ser um inteiro maior ou igual a zero',
      );
    }
    return quantidade;
  }

  private static validarMovimentacao(quantidade: number): void {
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new RegraDeNegocioException(
        'A quantidade movimentada deve ser um inteiro maior que zero',
      );
    }
  }
}
