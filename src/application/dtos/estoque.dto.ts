import { IsInt, IsPositive, Min } from 'class-validator';

export class CriarEstoqueDto {
  @IsInt()
  @IsPositive()
  produtoId: number;

  @IsInt()
  @Min(0)
  quantidadeAtual: number;
}

/**
 * Ajuste de inventário. Repare que não dá para trocar o produtoId: um
 * estoque pertence a um produto para sempre. ultimaAtualizacao também não
 * vem do cliente — o banco preenche sozinho (@updatedAt).
 */
export class AjustarEstoqueDto {
  @IsInt()
  @Min(0)
  quantidadeAtual: number;
}

export class MovimentarEstoqueDto {
  @IsInt()
  @IsPositive()
  quantidade: number;
}

export class EstoqueResponseDto {
  id: number;
  produtoId: number;
  quantidadeAtual: number;
  ultimaAtualizacao: Date | undefined;
}
