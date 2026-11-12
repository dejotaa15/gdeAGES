import { Estoque } from '../../domain/entities/estoque.entity';

export const ESTOQUE_REPOSITORY = Symbol('ESTOQUE_REPOSITORY');

export interface IEstoqueRepository {
  criar(estoque: Estoque): Promise<Estoque>;
  listar(): Promise<Estoque[]>;
  buscarPorId(id: number): Promise<Estoque | null>;
  buscarPorProdutoId(produtoId: number): Promise<Estoque | null>;
  buscarPorProdutoIds(produtoIds: number[]): Promise<Estoque[]>;
  salvar(estoque: Estoque): Promise<Estoque>;
  remover(id: number): Promise<void>;
}
