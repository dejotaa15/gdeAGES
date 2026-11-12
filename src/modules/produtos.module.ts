import { Module } from '@nestjs/common';
import { PRODUTO_REPOSITORY } from '../application/interfaces/produto.repository';
import { ProdutoService } from '../application/services/produto.service';
import { PrismaProdutoRepository } from '../infrastructure/repositories/prisma-produto.repository';
import { ProdutosController } from '../presentation/controllers/produtos.controller';

/**
 * Os módulos são a "composição": é o único lugar que liga a interface
 * (PRODUTO_REPOSITORY) à implementação concreta (PrismaProdutoRepository).
 */
@Module({
  controllers: [ProdutosController],
  providers: [
    ProdutoService,
    { provide: PRODUTO_REPOSITORY, useClass: PrismaProdutoRepository },
  ],
  exports: [ProdutoService],
})
export class ProdutosModule {}
