import { Compra } from '../../domain/entities/compra.entity';
import { StatusCompra } from '../../domain/enums/status-compra.enum';

export const COMPRA_REPOSITORY = Symbol('COMPRA_REPOSITORY');

export interface FiltroCompras {
  status?: StatusCompra;
  /** Inclusivo */
  inicio?: Date;
  /** Exclusivo */
  fim?: Date;
}

export interface ICompraRepository {
  /**
   * Grava a compra E baixa o estoque de forma atômica (tudo ou nada).
   * Se algum item não tiver estoque suficiente no momento da gravação,
   * nada é salvo e é lançada EstoqueInsuficienteException.
   */
  registrar(compra: Compra): Promise<Compra>;

  /** Marca como cancelada E devolve os itens ao estoque, de forma atômica. */
  cancelar(compra: Compra): Promise<Compra>;

  listar(filtro?: FiltroCompras): Promise<Compra[]>;
  buscarPorId(id: number): Promise<Compra | null>;
  remover(id: number): Promise<void>;
}
