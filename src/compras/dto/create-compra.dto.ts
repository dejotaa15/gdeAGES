async create(createCompraDto: CreateCompraDto) {
  return this.prisma.compra.create({
    data: {
      data: createCompraDto.data,

      itens: {
        create: createCompraDto.produtos.map((produto) => ({
          produtoId: produto.produtoId,
          quantidade: produto.quantidade,
        })),
      },
    },

    include: {
      itens: {
        include: {
          produto: true,
        },
      },
    },
  });
}