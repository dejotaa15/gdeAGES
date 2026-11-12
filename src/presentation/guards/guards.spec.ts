import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FakeTokenService } from '../../application/__fakes__/in-memory.repositories';
import { Cargo } from '../../domain/enums/cargo.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestAutenticada } from '../decorators/usuario-atual.decorator';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

function criarContexto(request: RequestAutenticada): ExecutionContext {
  return {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function reflectorCom(metadados: Record<string, unknown>): Reflector {
  return {
    getAllAndOverride: (chave: string) => metadados[chave],
  } as unknown as Reflector;
}

describe('AuthGuard', () => {
  const tokens = new FakeTokenService();

  it('libera rotas @Public() sem token', async () => {
    const guard = new AuthGuard(
      reflectorCom({ [IS_PUBLIC_KEY]: true }),
      tokens,
    );
    await expect(
      guard.canActivate(criarContexto({ headers: {} })),
    ).resolves.toBe(true);
  });

  it('bloqueia sem token (401)', async () => {
    const guard = new AuthGuard(reflectorCom({}), tokens);
    await expect(
      guard.canActivate(criarContexto({ headers: {} })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('bloqueia token inválido (401)', async () => {
    const guard = new AuthGuard(reflectorCom({}), tokens);
    await expect(
      guard.canActivate(
        criarContexto({ headers: { authorization: 'Bearer lixo' } }),
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('coloca o usuário na request quando o token é válido', async () => {
    const guard = new AuthGuard(reflectorCom({}), tokens);
    const request: RequestAutenticada = {
      headers: { authorization: 'Bearer token:u1:GERENTE' },
    };
    await guard.canActivate(criarContexto(request));
    expect(request.usuario).toMatchObject({ sub: 'u1', cargo: Cargo.GERENTE });
  });
});

describe('RolesGuard', () => {
  const comUsuario = (cargo: Cargo) =>
    criarContexto({ headers: {}, usuario: { sub: 'u', email: '', cargo } });

  it('sem @Roles(), qualquer usuário autenticado passa', () => {
    const guard = new RolesGuard(reflectorCom({}));
    expect(guard.canActivate(comUsuario(Cargo.ATENDENTE))).toBe(true);
  });

  it('libera quem tem um dos cargos exigidos', () => {
    const guard = new RolesGuard(
      reflectorCom({ [ROLES_KEY]: [Cargo.ADMIN, Cargo.GERENTE] }),
    );
    expect(guard.canActivate(comUsuario(Cargo.GERENTE))).toBe(true);
  });

  it('bloqueia quem não tem o cargo (403)', () => {
    const guard = new RolesGuard(reflectorCom({ [ROLES_KEY]: [Cargo.ADMIN] }));
    expect(() => guard.canActivate(comUsuario(Cargo.ATENDENTE))).toThrow(
      ForbiddenException,
    );
  });
});
