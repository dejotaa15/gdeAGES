import { Inject, Injectable } from '@nestjs/common';
import { Produto } from '../../domain/entities/produto.entity';
import {
  RecursoNaoEncontradoException,
  RegraDeNegocioException,
} from '../../domain/exceptions/domain.exceptions';
import {
  AtualizarProdutoDto,
  CriarProdutoDto,
  SubstituirProdutoDto,
} from '../dtos/produto.dto';
import {
  type IProdutoRepository,
  PRODUTO_REPOSITORY,
} from '../interfaces/produto.repository';

/**
 * Dependency Inversion: o service depende da INTERFACE IProdutoRepository,
 * não do Prisma. Trocar Prisma por TypeORM ou Mongo não muda este arquivo.
 */
@Injectable()
export class ProdutoService {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtos: IProdutoRepository,
  ) {}

  criar(dto: CriarProdutoDto): Promise<Produto> {
    return this.produtos.criar(new Produto(dto));
  }

  listar(): Promise<Produto[]> {
    return this.produtos.listar();
  }

  async buscarPorId(id: number): Promise<Produto> {
    const produto = await this.produtos.buscarPorId(id);
    if (!produto) throw new RecursoNaoEncontradoException('Produto', id);
    return produto;
  }

  /** Busca vários e garante que todos existem. */
  async buscarTodosPorIds(ids: number[]): Promise<Map<number, Produto>> {
    const encontrados = await this.produtos.buscarPorIds(ids);
    const porId = new Map(encontrados.map((p) => [p.id!, p]));
    const faltando = ids.find((id) => !porId.has(id));
    if (faltando !== undefined) {
      throw new RecursoNaoEncontradoException('Produto', faltando);
    }
    return porId;
  }

  async substituir(id: number, dto: SubstituirProdutoDto): Promise<Produto> {
    await this.buscarPorId(id);
    return this.produtos.salvar(new Produto({ id, ...dto }));
  }

  async atualizar(id: number, dto: AtualizarProdutoDto): Promise<Produto> {
    const produto = await this.buscarPorId(id);
    produto.atualizar(dto);
    return this.produtos.salvar(produto);
  }

  async remover(id: number): Promise<void> {
    await this.buscarPorId(id);
    if (await this.produtos.possuiCompras(id)) {
      throw new RegraDeNegocioException(
        'Não é possível remover um produto que já aparece em compras',
      );
    }
    await this.produtos.remover(id);
  }
}
