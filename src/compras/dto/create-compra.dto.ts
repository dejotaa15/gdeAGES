export class CreateCompraDto {
  dataCompra: Date;
  produtos: { produtoId: number; quantidade: number }[];
}