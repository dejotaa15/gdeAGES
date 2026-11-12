/**
 * Repositórios em memória para testes unitários.
 *
 * É aqui que a Inversão de Dependência se paga: como os services dependem
 * de INTERFACES, os testes trocam o Prisma por um array e rodam em
 * milissegundos, sem banco de dados.
 */
import { Compra } from '../../domain/entities/compra.entity';
import { Estoque } from '../../domain/entities/estoque.entity';
import { Produto } from '../../domain/entities/produto.entity';
import { Usuario } from '../../domain/entities/usuario.entity';
import { StatusCompra } from '../../domain/enums/status-compra.enum';
import { EstoqueInsuficienteException } from '../../domain/exceptions/domain.exceptions';
import {
  FiltroCompras,
  ICompraRepository,
} from '../interfaces/compra.repository';
import { IEstoqueRepository } from '../interfaces/estoque.repository';
import { IHashService } from '../interfaces/hash.service';
import { IProdutoRepository } from '../interfaces/produto.repository';
import { ITokenService, TokenPayload } from '../interfaces/token.service';
import { IUsuarioRepository } from '../interfaces/usuario.repository';

export class InMemoryProdutoRepository implements IProdutoRepository {
  itens: Produto[] = [];
  produtosComCompras = new Set<number>();
  private seq = 1;

  async criar(p: Produto) {
    const novo = new Produto({ id: this.seq++, nome: p.nome, preco: p.preco });
    this.itens.push(novo);
    return novo;
  }
  async listar() {
    return [...this.itens];
  }
  async buscarPorId(id: number) {
    return this.itens.find((p) => p.id === id) ?? null;
  }
  async buscarPorIds(ids: number[]) {
    return this.itens.filter((p) => ids.includes(p.id!));
  }
  async salvar(p: Produto) {
    this.itens = this.itens.map((x) => (x.id === p.id ? p : x));
    return p;
  }
  async remover(id: number) {
    this.itens = this.itens.filter((p) => p.id !== id);
  }
  async possuiCompras(id: number) {
    return this.produtosComCompras.has(id);
  }
}

export class InMemoryEstoqueRepository implements IEstoqueRepository {
  itens: Estoque[] = [];
  private seq = 1;

  async criar(e: Estoque) {
    const novo = new Estoque({
      id: this.seq++,
      produtoId: e.produtoId,
      quantidadeAtual: e.quantidadeAtual,
    });
    this.itens.push(novo);
    return novo;
  }
  async listar() {
    return [...this.itens];
  }
  async buscarPorId(id: number) {
    return this.itens.find((e) => e.id === id) ?? null;
  }
  async buscarPorProdutoId(produtoId: number) {
    return this.itens.find((e) => e.produtoId === produtoId) ?? null;
  }
  async buscarPorProdutoIds(ids: number[]) {
    return this.itens.filter((e) => ids.includes(e.produtoId));
  }
  async salvar(e: Estoque) {
    this.itens = this.itens.map((x) => (x.id === e.id ? e : x));
    return e;
  }
  async remover(id: number) {
    this.itens = this.itens.filter((e) => e.id !== id);
  }
}

export class InMemoryCompraRepository implements ICompraRepository {
  itens: Compra[] = [];
  private seq = 1;

  constructor(private readonly estoques: InMemoryEstoqueRepository) {}

  async registrar(compra: Compra) {
    for (const item of compra.itens) {
      const estoque = await this.estoques.buscarPorProdutoId(item.produtoId);
      if (!estoque?.possui(item.quantidade)) {
        throw new EstoqueInsuficienteException(item.produtoId);
      }
    }
    for (const item of compra.itens) {
      (await this.estoques.buscarPorProdutoId(item.produtoId))!.registrarSaida(
        item.quantidade,
      );
    }
    const nova = new Compra({
      id: this.seq++,
      data: compra.data,
      status: compra.status,
      usuarioId: compra.usuarioId,
      itens: compra.itens,
    });
    this.itens.push(nova);
    return nova;
  }

  async cancelar(compra: Compra) {
    for (const item of compra.itens) {
      (
        await this.estoques.buscarPorProdutoId(item.produtoId)
      )?.registrarEntrada(item.quantidade);
    }
    this.itens = this.itens.map((c) => (c.id === compra.id ? compra : c));
    return compra;
  }

  async listar(filtro: FiltroCompras = {}) {
    return this.itens.filter(
      (c) =>
        (!filtro.status || c.status === filtro.status) &&
        (!filtro.inicio || c.data >= filtro.inicio) &&
        (!filtro.fim || c.data < filtro.fim),
    );
  }
  async buscarPorId(id: number) {
    return this.itens.find((c) => c.id === id) ?? null;
  }
  async remover(id: number) {
    this.itens = this.itens.filter((c) => c.id !== id);
  }

  /** Atalho de teste para semear compras antigas. */
  semear(compra: Compra) {
    const nova = new Compra({
      id: this.seq++,
      data: compra.data,
      status: compra.status ?? StatusCompra.CONCLUIDA,
      usuarioId: compra.usuarioId,
      itens: compra.itens,
    });
    this.itens.push(nova);
    return nova;
  }
}

export class InMemoryUsuarioRepository implements IUsuarioRepository {
  itens: Usuario[] = [];
  private seq = 1;

  async criar(u: Usuario) {
    const novo = new Usuario({ ...u, id: `user-${this.seq++}` });
    this.itens.push(novo);
    return novo;
  }
  async listar() {
    return [...this.itens];
  }
  async buscarPorId(id: string) {
    return this.itens.find((u) => u.id === id) ?? null;
  }
  async buscarPorEmail(email: string) {
    return this.itens.find((u) => u.email === email) ?? null;
  }
  async salvar(u: Usuario) {
    this.itens = this.itens.map((x) => (x.id === u.id ? u : x));
    return u;
  }
  async remover(id: string) {
    this.itens = this.itens.filter((u) => u.id !== id);
  }
}

/** "Hash" previsível só para teste. */
export class FakeHashService implements IHashService {
  async gerar(texto: string) {
    return `hash(${texto})`;
  }
  async comparar(texto: string, hash: string) {
    return hash === `hash(${texto})`;
  }
}

export class FakeTokenService implements ITokenService {
  async gerar(payload: TokenPayload) {
    return `token:${payload.sub}:${payload.cargo}`;
  }
  async verificar(token: string): Promise<TokenPayload> {
    const [prefixo, sub, cargo] = token.split(':');
    if (prefixo !== 'token') throw new Error('token inválido');
    return { sub, email: '', cargo: cargo as TokenPayload['cargo'] };
  }
}
