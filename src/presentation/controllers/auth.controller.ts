import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { LoginDto, LoginResponseDto } from '../../application/dtos/auth.dto';
import { UsuarioResponseDto } from '../../application/dtos/usuario.dto';
import { UsuarioMapper } from '../../application/mappers/usuario.mapper';
import { UsuarioService } from '../../application/services/usuario.service';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { Public } from '../decorators/public.decorator';
import {
  UsuarioAtual,
  type UsuarioAutenticado,
} from '../decorators/usuario-atual.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly usuarioService: UsuarioService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.loginUseCase.executar(dto);
  }

  /** Quem sou eu? Útil para o front saber o cargo do usuário logado. */
  @Get('me')
  async me(
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<UsuarioResponseDto> {
    return UsuarioMapper.toResponse(
      await this.usuarioService.buscarPorId(usuario.sub),
    );
  }
}
