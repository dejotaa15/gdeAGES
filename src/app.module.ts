import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProdutosModule } from './produtos/produtos.module';
import { ComprasModule } from './compras/compras.module';
import { EstoqueModule } from './estoque/estoque.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ProdutosModule, ComprasModule, EstoqueModule, UsuariosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
@Module({
  imports: [
    PrismaModule,
    // seus outros módulos
  ],
})