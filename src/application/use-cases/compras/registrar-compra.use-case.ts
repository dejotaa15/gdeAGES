import { Injectable } from '@nestjs/common';
import { Compra } from '../../../domain/entities/compra.entity';
import { EstoqueInsuficienteException } from '../../../domain/exceptions/domain.exceptions';
import { CriarCompraDto } from '../../dtos/compra.dto';
import { CompraService } from '../../services/compra.service';
import { EstoqueService } from '../../services/estoque.service';
import { ProdutoService } from '../../services/produto.service';

/**
 * Coração do briefing: registrar uma compra mexe em três domínios
 * (Produto, Estoque e Compra) — por isso é um UseCase, não um Service.
 *
 * 1. Confere se todos os produtos existem.
 * 2. Copia o preço atual de cada produto para o item (snapshot).
 * 3. Confere o estoque (para dar uma mensagem de erro clara).
 * 4. Grava compra + baixa de estoque numa transação (no repositório).
 */
@Injectable()
export class RegistrarCompraUseCase {
  constructor(
    private readonly produtoService: ProdutoService,
    private readonly estoqueService: EstoqueService,
    private readonly compraService: CompraService,
  ) {}

  async executar(usuarioId: string, dto: CriarCompraDto): Promise<Compra> {
    const ids = [...new Set(dto.itens.map((i) => i.produtoId))];
    const produtos = await this.produtoService.buscarTodosPorIds(ids);

    const compra = Compra.registrar(
      usuarioId,
      dto.itens.map((item) => {
        const produto = produtos.get(item.produtoId)!;
        return {
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: produto.preco,
          nomeProduto: produto.nome,
        };
      }),
    );

    const estoques = await this.estoqueService.buscarPorProdutoIds(ids);
    for (const item of compra.itens) {
      const estoque = estoques.get(item.produtoId);
      if (!estoque?.possui(item.quantidade)) {
        throw new EstoqueInsuficienteException(
          item.produtoId,
          estoque?.quantidadeAtual ?? 0,
          item.quantidade,
        );
      }
    }

    // A checagem acima é "otimista". Se duas vendas simultâneas passarem
    // por ela, o repositório ainda impede o estoque de ficar negativo.
    return this.compraService.registrar(compra);
  }
}
