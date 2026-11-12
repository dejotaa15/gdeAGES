import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { StatusCompra } from '../../domain/enums/status-compra.enum';

export class ItemCompraDto {
  @IsInt()
  @IsPositive()
  produtoId: number;

  @IsInt()
  @IsPositive()
  quantidade: number;
}

/**
 * Repare que o cliente NÃO manda o preço: quem decide o preço é o
 * backend, consultando o produto. Senão qualquer um compraria por R$ 0,01.
 */
export class CriarCompraDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemCompraDto)
  itens: ItemCompraDto[];
}

export class PeriodoQueryDto {
  /** Ex.: 2026-11-01 (inclusivo) */
  @IsOptional()
  @IsDateString()
  inicio?: string;

  /** Ex.: 2026-11-30 (inclusivo — o dia inteiro conta) */
  @IsOptional()
  @IsDateString()
  fim?: string;
}

export class ListarComprasQueryDto extends PeriodoQueryDto {
  @IsOptional()
  @IsEnum(StatusCompra)
  status?: StatusCompra;
}

export class ItemCompraResponseDto {
  produtoId: number;
  nomeProduto: string | null;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export class CompraResponseDto {
  id: number;
  data: Date;
  status: StatusCompra;
  usuarioId: string | null;
  itens: ItemCompraResponseDto[];
  total: number;
}

export class FaturamentoPorProdutoDto {
  produtoId: number;
  nomeProduto: string | null;
  quantidadeVendida: number;
  total: number;
}

export class FaturamentoResponseDto {
  inicio: string | null;
  fim: string | null;
  quantidadeDeCompras: number;
  itensVendidos: number;
  total: number;
  ticketMedio: number;
  porProduto: FaturamentoPorProdutoDto[];
}
