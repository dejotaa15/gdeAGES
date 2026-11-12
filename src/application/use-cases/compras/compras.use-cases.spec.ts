import { Compra } from '../../../domain/entities/compra.entity';
import { Estoque } from '../../../domain/entities/estoque.entity';
import { Produto } from '../../../domain/entities/produto.entity';
import { StatusCompra } from '../../../domain/enums/status-compra.enum';
import {
  EstoqueInsuficienteException,
  RecursoNaoEncontradoException,
} from '../../../domain/exceptions/domain.exceptions';
import {
  InMemoryCompraRepository,
  InMemoryEstoqueRepository,
  InMemoryProdutoRepository,
} from '../../__fakes__/in-memory.repositories';
import { CompraService } from '../../services/compra.service';
import { EstoqueService } from '../../services/estoque.service';
import { ProdutoService } from '../../services/produto.service';
import { CancelarCompraUseCase } from './cancelar-compra.use-case';
import { ConsultarFaturamentoUseCase } from './consultar-faturamento.use-case';
import { RegistrarCompraUseCase } from './registrar-compra.use-case';

describe('Use cases de Compras', () => {
  let produtos: InMemoryProdutoRepository;
  let estoques: InMemoryEstoqueRepository;
  let compras: InMemoryCompraRepository;
  let registrar: RegistrarCompraUseCase;
  let cancelar: CancelarCompraUseCase;
  let faturamento: ConsultarFaturamentoUseCase;

  beforeEach(async () => {
    produtos = new InMemoryProdutoRepository();
    estoques = new InMemoryEstoqueRepository();
    compras = new InMemoryCompraRepository(estoques);

    const produtoService = new ProdutoService(produtos);
    const estoqueService = new EstoqueService(estoques, produtoService);
    const compraService = new CompraService(compras);

    registrar = new RegistrarCompraUseCase(
      produtoService,
      estoqueService,
      compraService,
    );
    cancelar = new CancelarCompraUseCase(compraService);
    faturamento = new ConsultarFaturamentoUseCase(compraService);

    await produtos.criar(new Produto({ nome: 'Dipirona', preco: 9.9 }));
    await produtos.criar(new Produto({ nome: 'Protetor', preco: 59.99 }));
    await estoques.criar(new Estoque({ produtoId: 1, quantidadeAtual: 10 }));
    await estoques.criar(new Estoque({ produtoId: 2, quantidadeAtual: 1 }));
  });

  describe('RegistrarCompraUseCase', () => {
    it('registra a compra, baixa o estoque e calcula o total', async () => {
      const compra = await registrar.executar('u1', {
        itens: [
          { produtoId: 1, quantidade: 3 },
          { produtoId: 2, quantidade: 1 },
        ],
      });

      expect(compra.total).toBe(89.69);
      expect(compra.usuarioId).toBe('u1');
      expect((await estoques.buscarPorProdutoId(1))!.quantidadeAtual).toBe(7);
      expect((await estoques.buscarPorProdutoId(2))!.quantidadeAtual).toBe(0);
    });

    it('congela o preço do produto no momento da compra', async () => {
      const compra = await registrar.executar('u1', {
        itens: [{ produtoId: 1, quantidade: 1 }],
      });
      const produto = (await produtos.buscarPorId(1))!;
      produto.atualizar({ preco: 100 });

      expect(compra.itens[0].precoUnitario).toBe(9.9);
    });

    it('recusa quando falta estoque e não baixa nada', async () => {
      await expect(
        registrar.executar('u1', {
          itens: [
            { produtoId: 1, quantidade: 2 },
            { produtoId: 2, quantidade: 5 },
          ],
        }),
      ).rejects.toThrow(EstoqueInsuficienteException);

      expect((await estoques.buscarPorProdutoId(1))!.quantidadeAtual).toBe(10);
      expect(compras.itens).toHaveLength(0);
    });

    it('considera itens repetidos juntos ao checar o estoque', async () => {
      // 1 + 1 = 2 protetores, mas só existe 1
      await expect(
        registrar.executar('u1', {
          itens: [
            { produtoId: 2, quantidade: 1 },
            { produtoId: 2, quantidade: 1 },
          ],
        }),
      ).rejects.toThrow(EstoqueInsuficienteException);
    });

    it('recusa produto inexistente', async () => {
      await expect(
        registrar.executar('u1', { itens: [{ produtoId: 99, quantidade: 1 }] }),
      ).rejects.toThrow(RecursoNaoEncontradoException);
    });
  });

  describe('CancelarCompraUseCase', () => {
    it('cancela e devolve os itens ao estoque', async () => {
      const compra = await registrar.executar('u1', {
        itens: [{ produtoId: 1, quantidade: 4 }],
      });

      const cancelada = await cancelar.executar(compra.id!);

      expect(cancelada.status).toBe(StatusCompra.CANCELADA);
      expect((await estoques.buscarPorProdutoId(1))!.quantidadeAtual).toBe(10);
    });
  });

  describe('ConsultarFaturamentoUseCase', () => {
    it('soma só as concluídas do período e ordena por produto', async () => {
      const item = (produtoId: number, quantidade: number, preco: number) => ({
        produtoId,
        quantidade,
        precoUnitario: preco,
      });

      compras.semear(
        new Compra({
          data: new Date('2026-11-10T12:00:00Z'),
          itens: Compra.registrar('u1', [item(1, 2, 10), item(2, 1, 50)]).itens,
        }),
      );
      compras.semear(
        new Compra({
          data: new Date('2026-11-11T12:00:00Z'),
          status: StatusCompra.CANCELADA,
          itens: Compra.registrar('u1', [item(1, 100, 10)]).itens,
        }),
      );
      compras.semear(
        new Compra({
          data: new Date('2026-10-01T12:00:00Z'),
          itens: Compra.registrar('u1', [item(1, 1, 10)]).itens,
        }),
      );

      const resultado = await faturamento.executar({
        inicio: '2026-11-01',
        fim: '2026-11-30',
      });

      expect(resultado.quantidadeDeCompras).toBe(1);
      expect(resultado.total).toBe(70);
      expect(resultado.porProduto.map((p) => p.produtoId)).toEqual([2, 1]);
    });

    it('inclui o dia inteiro da data de fim', async () => {
      compras.semear(
        new Compra({
          data: new Date('2026-11-30T23:30:00Z'),
          itens: Compra.registrar('u1', [
            { produtoId: 1, quantidade: 1, precoUnitario: 10 },
          ]).itens,
        }),
      );

      const resultado = await faturamento.executar({ fim: '2026-11-30' });
      expect(resultado.quantidadeDeCompras).toBe(1);
    });
  });
});
