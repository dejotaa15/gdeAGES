import { SetMetadata } from '@nestjs/common';
import { Cargo } from '../../domain/enums/cargo.enum';

export const ROLES_KEY = 'roles';

/** Restringe a rota (ou o controller inteiro) aos cargos informados. */
export const Roles = (...cargos: Cargo[]) => SetMetadata(ROLES_KEY, cargos);
