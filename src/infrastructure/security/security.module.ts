import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { HASH_SERVICE } from '../../application/interfaces/hash.service';
import { TOKEN_SERVICE } from '../../application/interfaces/token.service';
import { BcryptHashService } from './bcrypt-hash.service';
import { JwtTokenService } from './jwt-token.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('A variável de ambiente JWT_SECRET não foi definida');
        }
        return {
          secret,
          // Token curto limita o estrago se ele vazar (JWT não dá pra revogar)
          signOptions: {
            expiresIn: (process.env.JWT_EXPIRES_IN ?? '1h') as StringValue,
          },
        };
      },
    }),
  ],
  providers: [
    { provide: HASH_SERVICE, useClass: BcryptHashService },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
  ],
  exports: [HASH_SERVICE, TOKEN_SERVICE],
})
export class SecurityModule {}
