import { Module } from '@nestjs/common';
import { USUARIO_REPOSITORY } from '../application/interfaces/usuario.repository';
import { UsuarioService } from '../application/services/usuario.service';
import { AtualizarUsuarioUseCase } from '../application/use-cases/usuarios/atualizar-usuario.use-case';
import { CriarUsuarioUseCase } from '../application/use-cases/usuarios/criar-usuario.use-case';
import { PrismaUsuarioRepository } from '../infrastructure/repositories/prisma-usuario.repository';
import { UsuariosController } from '../presentation/controllers/usuarios.controller';

@Module({
  controllers: [UsuariosController],
  providers: [
    UsuarioService,
    CriarUsuarioUseCase,
    AtualizarUsuarioUseCase,
    { provide: USUARIO_REPOSITORY, useClass: PrismaUsuarioRepository },
  ],
  exports: [UsuarioService],
})
export class UsuariosModule {}
