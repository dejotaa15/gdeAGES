import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Cargo } from '../../domain/enums/cargo.enum';

export class CriarUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsOptional()
  @IsEnum(Cargo)
  cargo?: Cargo;
}

export class AtualizarUsuarioDto extends PartialType(CriarUsuarioDto) {}

/** Repare: não existe campo de senha na resposta. Nunca devolva hash. */
export class UsuarioResponseDto {
  id: string;
  nome: string | null;
  email: string;
  cargo: Cargo;
  criadoEm: Date | undefined;
}
