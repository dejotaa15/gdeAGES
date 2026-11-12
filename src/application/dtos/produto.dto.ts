import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CriarProdutoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  preco: number;
}

/** PUT substitui o recurso inteiro: exige todos os campos. */
export class SubstituirProdutoDto extends CriarProdutoDto {}

/** PATCH altera parcialmente: todos os campos opcionais. */
export class AtualizarProdutoDto extends PartialType(CriarProdutoDto) {}

export class ProdutoResponseDto {
  id: number;
  nome: string;
  preco: number;
}
