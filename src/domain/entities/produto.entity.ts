import { RegraDeNegocioException } from '../exceptions/domain.exceptions';

export interface ProdutoProps {
  id?: number;
  nome: string;
  preco: number;
}

export class Produto {
  readonly id?: number;
  private _nome: string;
  private _preco: number;

  constructor(props: ProdutoProps) {
    this.id = props.id;
    this._nome = Produto.validarNome(props.nome);
    this._preco = Produto.validarPreco(props.preco);
  }

  get nome(): string {
    return this._nome;
  }

  get preco(): number {
    return this._preco;
  }

  /** Aplica uma alteração parcial garantindo que o produto continue válido. */
  atualizar(dados: Partial<Pick<ProdutoProps, 'nome' | 'preco'>>): void {
    if (dados.nome !== undefined) this._nome = Produto.validarNome(dados.nome);
    if (dados.preco !== undefined)
      this._preco = Produto.validarPreco(dados.preco);
  }

  private static validarNome(nome: string): string {
    const limpo = nome?.trim();
    if (!limpo) {
      throw new RegraDeNegocioException('O nome do produto é obrigatório');
    }
    return limpo;
  }

  private static validarPreco(preco: number): number {
    if (!Number.isFinite(preco) || preco <= 0) {
      throw new RegraDeNegocioException('O preço deve ser maior que zero');
    }
    return Math.round(preco * 100) / 100;
  }
}
