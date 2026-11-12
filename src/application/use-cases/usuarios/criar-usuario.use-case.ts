import { Inject, Injectable } from '@nestjs/common';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { Cargo } from '../../../domain/enums/cargo.enum';
import { CriarUsuarioDto } from '../../dtos/usuario.dto';
import { HASH_SERVICE, type IHashService } from '../../interfaces/hash.service';
import { UsuarioService } from '../../services/usuario.service';

@Injectable()
export class CriarUsuarioUseCase {
  constructor(
    private readonly usuarioService: UsuarioService,
    @Inject(HASH_SERVICE) private readonly hash: IHashService,
  ) {}

  async executar(dto: CriarUsuarioDto): Promise<Usuario> {
    const usuario = new Usuario({
      nome: dto.nome,
      email: dto.email,
      senhaHash: await this.hash.gerar(dto.senha),
      cargo: dto.cargo ?? Cargo.ATENDENTE,
    });
    return this.usuarioService.criar(usuario);
  }
}
