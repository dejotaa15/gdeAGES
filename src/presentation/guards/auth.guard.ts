import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  type ITokenService,
  TOKEN_SERVICE,
} from '../../application/interfaces/token.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RequestAutenticada } from '../decorators/usuario-atual.decorator';

/**
 * AUTENTICAÇÃO — o "porteiro": quem é você? Prove.
 * Lê o header "Authorization: Bearer <token>", valida a assinatura e a
 * expiração do JWT e pendura o usuário na request.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ehPublica = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (ehPublica) return true;

    const request = context.switchToHttp().getRequest<RequestAutenticada>();
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token de acesso não informado');
    }

    try {
      request.usuario = await this.tokenService.verificar(token);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return true;
  }
}
