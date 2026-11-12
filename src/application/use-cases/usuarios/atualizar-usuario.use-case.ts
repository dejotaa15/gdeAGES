import { Inject, Injectable } from '@nestjs/common';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { AtualizarUsuarioDto } from '../../dtos/usuario.dto';
import { HASH_SERVICE, type IHashService } from '../../interfaces/hash.service';
import { UsuarioService } from '../../services/usuario.service';

@Injectable()
export class AtualizarUsuarioUseCase {
  constructor(
    private readonly usuarioService: UsuarioService,
    @Inject(HASH_SERVICE) private readonly hash: IHashService,
  ) {}

  async executar(id: string, dto: AtualizarUsuarioDto): Promise<Usuario> {
    const usuario = await this.usuarioService.buscarPorId(id);

    const atualizado = new Usuario({
      id: usuario.id,
      criadoEm: usuario.criadoEm,
      nome: dto.nome ?? usuario.nome,
      email: dto.email ?? usuario.email,
      cargo: dto.cargo ?? usuario.cargo,
      // Se veio senha nova, gera hash novo. Nunca salva texto puro.
      senhaHash: dto.senha
        ? await this.hash.gerar(dto.senha)
        : usuario.senhaHash,
    });

    return this.usuarioService.salvar(atualizado);
  }
}
