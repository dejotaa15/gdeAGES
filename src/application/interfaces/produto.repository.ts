import { Produto } from '../../domain/entities/produto.entity';

/**
 * Token de injeção. Interfaces do TypeScript somem depois de compiladas,
 * então o NestJS precisa de um valor concreto (Symbol) para saber qual
 * implementação injetar no lugar da interface.
 */
export const PRODUTO_REPOSITORY = Symbol('PRODUTO_REPOSITORY');

export interface IProdutoRepository {
  criar(produto: Produto): Promise<Produto>;
  listar(): Promise<Produto[]>;
  buscarPorId(id: number): Promise<Produto | null>;
  buscarPorIds(ids: number[]): Promise<Produto[]>;
  salvar(produto: Produto): Promise<Produto>;
  remover(id: number): Promise<void>;
  possuiCompras(id: number): Promise<boolean>;
}
