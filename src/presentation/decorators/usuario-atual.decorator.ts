import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '../../application/interfaces/token.service';

export type UsuarioAutenticado = TokenPayload;

export interface RequestAutenticada {
  headers: Record<string, string | undefined>;
  usuario?: UsuarioAutenticado;
}

/** Injeta no controller o usuário que o AuthGuard extraiu do token. */
export const UsuarioAtual = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UsuarioAutenticado | undefined =>
    ctx.switchToHttp().getRequest<RequestAutenticada>().usuario,
);
