import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { DatabaseModule } from './infrastructure/database/database.module';
import { SecurityModule } from './infrastructure/security/security.module';
import { AuthModule } from './modules/auth.module';
import { ComprasModule } from './modules/compras.module';
import { EstoqueModule } from './modules/estoque.module';
import { ProdutosModule } from './modules/produtos.module';
import { UsuariosModule } from './modules/usuarios.module';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';
import { AuthGuard } from './presentation/guards/auth.guard';
import { RolesGuard } from './presentation/guards/roles.guard';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule,
    AuthModule,
    UsuariosModule,
    ProdutosModule,
    EstoqueModule,
    ComprasModule,
  ],
  providers: [
    // A ORDEM IMPORTA: primeiro autentica (quem é?), depois autoriza (pode?).
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // remove campos que não estão no DTO
        forbidNonWhitelisted: true, // ...e avisa o cliente com 400
        transform: true, // converte o JSON nas classes de DTO
      }),
    },
  ],
})
export class AppModule {}
