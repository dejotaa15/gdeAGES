import { Inject, Injectable } from '@nestjs/common';
import { Estoque } from '../../domain/entities/estoque.entity';
import {
  ConflitoException,
  RecursoNaoEncontradoException,
} from '../../domain/exceptions/domain.exceptions';
import { CriarEstoqueDto } from '../dtos/estoque.dto';
import {
  ESTOQUE_REPOSITORY,
  type IEstoqueRepository,
} from '../interfaces/estoque.repository';
import { ProdutoService } from './produto.service';

@Injectable()
export class EstoqueService {
  constructor(
    @Inject(ESTOQUE_REPOSITORY)
    private readonly estoques: IEstoqueRepository,
    private readonly produtoService: ProdutoService,
  ) {}

  async criar(dto: CriarEstoqueDto): Promise<Estoque> {
    await this.produtoService.buscarPorId(dto.produtoId);

    if (await this.estoques.buscarPorProdutoId(dto.produtoId)) {
      throw new ConflitoException(
        `O produto ${dto.produtoId} já possui estoque cadastrado`,
      );
    }

    return this.estoques.criar(new Estoque(dto));
  }

  listar(): Promise<Estoque[]> {
    return this.estoques.listar();
  }

  async buscarPorId(id: number): Promise<Estoque> {
    const estoque = await this.estoques.buscarPorId(id);
    if (!estoque) throw new RecursoNaoEncontradoException('Estoque', id);
    return estoque;
  }

  /** Estoques indexados por produtoId (produto sem estoque fica de fora). */
  async buscarPorProdutoIds(
    produtoIds: number[],
  ): Promise<Map<number, Estoque>> {
    const estoques = await this.estoques.buscarPorProdutoIds(produtoIds);
    return new Map(estoques.map((e) => [e.produtoId, e]));
  }

  salvar(estoque: Estoque): Promise<Estoque> {
    return this.estoques.salvar(estoque);
  }

  async remover(id: number): Promise<void> {
    await this.buscarPorId(id);
    await this.estoques.remover(id);
  }
}
