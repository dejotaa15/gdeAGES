import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cargo } from '../../domain/enums/cargo.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestAutenticada } from '../decorators/usuario-atual.decorator';

/**
 * AUTORIZAÇÃO — o "segurança da área VIP": onde você pode ir?
 * Roda DEPOIS do AuthGuard. Compara o cargo que veio no JWT com os cargos
 * exigidos por @Roles(). Sem @Roles(), basta estar autenticado.
 *
 * 401 = não sei quem você é. 403 = sei quem você é, mas você não pode.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const cargosPermitidos = this.reflector.getAllAndOverride<Cargo[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!cargosPermitidos?.length) return true;

    const { usuario } = context.switchToHttp().getRequest<RequestAutenticada>();
    if (!usuario || !cargosPermitidos.includes(usuario.cargo)) {
      throw new ForbiddenException(
        `Acesso permitido apenas para: ${cargosPermitidos.join(', ')}`,
      );
    }
    return true;
  }
}
