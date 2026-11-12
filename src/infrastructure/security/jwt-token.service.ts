import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ITokenService,
  TokenPayload,
} from '../../application/interfaces/token.service';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwt: JwtService) {}

  gerar(payload: TokenPayload): Promise<string> {
    return this.jwt.signAsync({ ...payload });
  }

  async verificar(token: string): Promise<TokenPayload> {
    const { sub, email, cargo } =
      await this.jwt.verifyAsync<TokenPayload>(token);
    return { sub, email, cargo };
  }
}
