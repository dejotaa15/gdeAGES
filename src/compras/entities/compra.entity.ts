export class Compra {
  id: number;
  dataCompra: Date;
  produtos: { produtoId: number; quantidade: number }[];
}