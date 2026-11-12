import { Inject, Injectable } from '@nestjs/common';
import { Usuario } from '../../domain/entities/usuario.entity';
import {
  ConflitoException,
  RecursoNaoEncontradoException,
} from '../../domain/exceptions/domain.exceptions';
import {
  type IUsuarioRepository,
  USUARIO_REPOSITORY,
} from '../interfaces/usuario.repository';

@Injectable()
export class UsuarioService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarios: IUsuarioRepository,
  ) {}

  async criar(usuario: Usuario): Promise<Usuario> {
    await this.garantirEmailDisponivel(usuario.email);
    return this.usuarios.criar(usuario);
  }

  listar(): Promise<Usuario[]> {
    return this.usuarios.listar();
  }

  async buscarPorId(id: string): Promise<Usuario> {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario) throw new RecursoNaoEncontradoException('Usuário', id);
    return usuario;
  }

  buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.usuarios.buscarPorEmail(email.trim().toLowerCase());
  }

  async salvar(usuario: Usuario): Promise<Usuario> {
    await this.garantirEmailDisponivel(usuario.email, usuario.id);
    return this.usuarios.salvar(usuario);
  }

  async remover(id: string): Promise<void> {
    await this.buscarPorId(id);
    await this.usuarios.remover(id);
  }

  private async garantirEmailDisponivel(email: string, idAtual?: string) {
    const existente = await this.buscarPorEmail(email);
    if (existente && existente.id !== idAtual) {
      throw new ConflitoException(`O e-mail ${email} já está em uso`);
    }
  }
}
