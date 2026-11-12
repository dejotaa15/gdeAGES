import { Module } from '@nestjs/common';
import { LoginUseCase } from '../application/use-cases/auth/login.use-case';
import { AuthController } from '../presentation/controllers/auth.controller';
import { UsuariosModule } from './usuarios.module';

@Module({
  imports: [UsuariosModule],
  controllers: [AuthController],
  providers: [LoginUseCase],
})
export class AuthModule {}
