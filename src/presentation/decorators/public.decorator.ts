import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Todas as rotas exigem token por padrão (o AuthGuard é global).
 * Use @Public() só nas rotas que precisam ser abertas, como o login.
 * Assim, esquecer um decorator deixa a rota FECHADA, não aberta.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
