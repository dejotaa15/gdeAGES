import { Cargo } from '../../domain/enums/cargo.enum';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

/**
 * Claims do JWT. Nada sensível aqui: o payload é só Base64 e qualquer um
 * consegue ler. Guardamos o cargo para o RolesGuard não precisar ir ao banco.
 */
export interface TokenPayload {
  sub: string;
  email: string;
  cargo: Cargo;
}

export interface ITokenService {
  gerar(payload: TokenPayload): Promise<string>;
  /** Lança erro se o token for inválido ou estiver expirado. */
  verificar(token: string): Promise<TokenPayload>;
}
