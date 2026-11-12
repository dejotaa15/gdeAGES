import { Inject, Injectable } from '@nestjs/common';
import { CredenciaisInvalidasException } from '../../../domain/exceptions/domain.exceptions';
import { LoginDto, LoginResponseDto } from '../../dtos/auth.dto';
import { UsuarioMapper } from '../../mappers/usuario.mapper';
import { HASH_SERVICE, type IHashService } from '../../interfaces/hash.service';
import {
  type ITokenService,
  TOKEN_SERVICE,
} from '../../interfaces/token.service';
import { UsuarioService } from '../../services/usuario.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usuarioService: UsuarioService,
    @Inject(HASH_SERVICE) private readonly hash: IHashService,
    @Inject(TOKEN_SERVICE) private readonly token: ITokenService,
  ) {}

  async executar(dto: LoginDto): Promise<LoginResponseDto> {
    const usuario = await this.usuarioService.buscarPorEmail(dto.email);

    // Mesma mensagem para "e-mail não existe" e "senha errada": assim
    // ninguém descobre quais e-mails estão cadastrados.
    const senhaConfere =
      usuario !== null &&
      (await this.hash.comparar(dto.senha, usuario.senhaHash));

    if (!usuario || !senhaConfere) {
      throw new CredenciaisInvalidasException();
    }

    const accessToken = await this.token.gerar({
      sub: usuario.id!,
      email: usuario.email,
      cargo: usuario.cargo,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      usuario: UsuarioMapper.toResponse(usuario),
    };
  }
}
