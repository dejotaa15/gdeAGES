import { Module } from '@nestjs/common';
import { ESTOQUE_REPOSITORY } from '../application/interfaces/estoque.repository';
import { EstoqueService } from '../application/services/estoque.service';
import { MovimentarEstoqueUseCase } from '../application/use-cases/estoque/movimentar-estoque.use-case';
import { PrismaEstoqueRepository } from '../infrastructure/repositories/prisma-estoque.repository';
import { EstoqueController } from '../presentation/controllers/estoque.controller';
import { ProdutosModule } from './produtos.module';

@Module({
  imports: [ProdutosModule],
  controllers: [EstoqueController],
  providers: [
    EstoqueService,
    MovimentarEstoqueUseCase,
    { provide: ESTOQUE_REPOSITORY, useClass: PrismaEstoqueRepository },
  ],
  exports: [EstoqueService],
})
export class EstoqueModule {}
