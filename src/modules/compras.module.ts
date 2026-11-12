import { Module } from '@nestjs/common';
import { COMPRA_REPOSITORY } from '../application/interfaces/compra.repository';
import { CompraService } from '../application/services/compra.service';
import { CancelarCompraUseCase } from '../application/use-cases/compras/cancelar-compra.use-case';
import { ConsultarFaturamentoUseCase } from '../application/use-cases/compras/consultar-faturamento.use-case';
import { RegistrarCompraUseCase } from '../application/use-cases/compras/registrar-compra.use-case';
import { PrismaCompraRepository } from '../infrastructure/repositories/prisma-compra.repository';
import { ComprasController } from '../presentation/controllers/compras.controller';
import { EstoqueModule } from './estoque.module';
import { ProdutosModule } from './produtos.module';

@Module({
  imports: [ProdutosModule, EstoqueModule],
  controllers: [ComprasController],
  providers: [
    CompraService,
    RegistrarCompraUseCase,
    CancelarCompraUseCase,
    ConsultarFaturamentoUseCase,
    { provide: COMPRA_REPOSITORY, useClass: PrismaCompraRepository },
  ],
})
export class ComprasModule {}
