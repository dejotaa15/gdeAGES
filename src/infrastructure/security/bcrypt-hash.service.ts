import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IHashService } from '../../application/interfaces/hash.service';

/**
 * bcrypt é lento de propósito: dificulta ataques de força bruta caso o
 * banco vaze. Cada hash leva um "salt" aleatório, então duas senhas
 * iguais geram hashes diferentes.
 */
@Injectable()
export class BcryptHashService implements IHashService {
  private readonly rounds = 10;

  gerar(texto: string): Promise<string> {
    return bcrypt.hash(texto, this.rounds);
  }

  comparar(texto: string, hash: string): Promise<boolean> {
    return bcrypt.compare(texto, hash);
  }
}
