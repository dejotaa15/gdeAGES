import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  AtualizarUsuarioDto,
  CriarUsuarioDto,
  UsuarioResponseDto,
} from '../../application/dtos/usuario.dto';
import { UsuarioMapper } from '../../application/mappers/usuario.mapper';
import { UsuarioService } from '../../application/services/usuario.service';
import { AtualizarUsuarioUseCase } from '../../application/use-cases/usuarios/atualizar-usuario.use-case';
import { CriarUsuarioUseCase } from '../../application/use-cases/usuarios/criar-usuario.use-case';
import { Cargo } from '../../domain/enums/cargo.enum';
import { Roles } from '../decorators/roles.decorator';

/** Gestão de usuários é exclusiva do ADMIN (vale para o controller todo). */
@Controller('usuarios')
@Roles(Cargo.ADMIN)
export class UsuariosController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly criarUsuario: CriarUsuarioUseCase,
    private readonly atualizarUsuario: AtualizarUsuarioUseCase,
  ) {}

  @Post()
  async criar(@Body() dto: CriarUsuarioDto): Promise<UsuarioResponseDto> {
    return UsuarioMapper.toResponse(await this.criarUsuario.executar(dto));
  }

  @Get()
  async listar(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.usuarioService.listar();
    return usuarios.map((u) => UsuarioMapper.toResponse(u));
  }

  @Get(':id')
  async buscar(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UsuarioResponseDto> {
    return UsuarioMapper.toResponse(await this.usuarioService.buscarPorId(id));
  }

  @Patch(':id')
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    return UsuarioMapper.toResponse(
      await this.atualizarUsuario.executar(id, dto),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usuarioService.remover(id);
  }
}
