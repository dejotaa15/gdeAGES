import { StatusCompra } from '../enums/status-compra.enum';
import {
  EstoqueInsuficienteException,
  RegraDeNegocioException,
} from '../exceptions/domain.exceptions';
import { Compra } from './compra.entity';
import { Estoque } from './estoque.entity';
import { Produto } from './produto.entity';

describe('Regras de domínio', () => {
  describe('Produto', () => {
    it('não aceita preço zero ou negativo', () => {
      expect(() => new Produto({ nome: 'X', preco: 0 })).toThrow(
        RegraDeNegocioException,
      );
    });

    it('não aceita nome vazio, nem em atualização parcial', () => {
      const produto = new Produto({ nome: 'Dipirona', preco: 10 });
      expect(() => produto.atualizar({ nome: '   ' })).toThrow(
        RegraDeNegocioException,
      );
    });
  });

  describe('Estoque', () => {
    it('não deixa a quantidade ficar negativa', () => {
      const estoque = new Estoque({ produtoId: 1, quantidadeAtual: 2 });
      expect(() => estoque.registrarSaida(3)).toThrow(
        EstoqueInsuficienteException,
      );
      expect(estoque.quantidadeAtual).toBe(2);
    });

    it('registra entrada e saída', () => {
      const estoque = new Estoque({ produtoId: 1, quantidadeAtual: 2 });
      estoque.registrarEntrada(5);
      estoque.registrarSaida(4);
      expect(estoque.quantidadeAtual).toBe(3);
    });

    it('rejeita movimentações não inteiras', () => {
      const estoque = new Estoque({ produtoId: 1, quantidadeAtual: 2 });
      expect(() => estoque.registrarEntrada(1.5)).toThrow(
        RegraDeNegocioException,
      );
    });
  });

  describe('Compra', () => {
    it('soma itens repetidos do mesmo produto', () => {
      const compra = Compra.registrar('u1', [
        { produtoId: 1, quantidade: 2, precoUnitario: 10 },
        { produtoId: 1, quantidade: 3, precoUnitario: 10 },
      ]);
      expect(compra.itens).toHaveLength(1);
      expect(compra.itens[0].quantidade).toBe(5);
    });

    it('calcula o total sem erro de ponto flutuante', () => {
      const compra = Compra.registrar('u1', [
        { produtoId: 1, quantidade: 1, precoUnitario: 0.1 },
        { produtoId: 2, quantidade: 1, precoUnitario: 0.2 },
      ]);
      expect(compra.total).toBe(0.3); // em float puro daria 0.30000000000000004
    });

    it('não pode ser cancelada duas vezes', () => {
      const compra = Compra.registrar('u1', [
        { produtoId: 1, quantidade: 1, precoUnitario: 1 },
      ]);
      compra.cancelar();
      expect(compra.status).toBe(StatusCompra.CANCELADA);
      expect(() => compra.cancelar()).toThrow(RegraDeNegocioException);
    });

    it('só pode ser removida depois de cancelada', () => {
      const compra = Compra.registrar('u1', [
        { produtoId: 1, quantidade: 1, precoUnitario: 1 },
      ]);
      expect(() => compra.garantirQuePodeSerRemovida()).toThrow(
        RegraDeNegocioException,
      );
      compra.cancelar();
      expect(() => compra.garantirQuePodeSerRemovida()).not.toThrow();
    });

    it('exige pelo menos um item', () => {
      expect(() => Compra.registrar('u1', [])).toThrow(RegraDeNegocioException);
    });
  });
});
