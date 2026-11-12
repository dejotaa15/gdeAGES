-- CreateEnum
CREATE TYPE "Cargo" AS ENUM ('ADMIN', 'GERENTE', 'ATENDENTE');

-- CreateEnum
CREATE TYPE "StatusCompra" AS ENUM ('CONCLUIDA', 'CANCELADA');

-- AlterTable: cargo do usuário (usuários antigos viram ATENDENTE)
ALTER TABLE "User" ADD COLUMN "cargo" "Cargo" NOT NULL DEFAULT 'ATENDENTE';

-- AlterTable: preço em Decimal (dinheiro não deve ser Float)
ALTER TABLE "Produto" ALTER COLUMN "preco" SET DATA TYPE DECIMAL(10,2);

-- AlterTable: compra ganha status e o usuário que registrou
ALTER TABLE "Compra" ADD COLUMN "status" "StatusCompra" NOT NULL DEFAULT 'CONCLUIDA',
ADD COLUMN "usuarioId" TEXT;

-- AlterTable: item guarda o preço do momento da compra.
-- Itens antigos recebem o preço atual do produto antes de virar NOT NULL.
ALTER TABLE "ItemCompra" ADD COLUMN "precoUnitario" DECIMAL(10,2);
UPDATE "ItemCompra" i SET "precoUnitario" = p."preco" FROM "Produto" p WHERE p."id" = i."produtoId";
ALTER TABLE "ItemCompra" ALTER COLUMN "precoUnitario" SET NOT NULL;

-- AlterTable: estoque com valores padrão
ALTER TABLE "Estoque" ALTER COLUMN "quantidadeAtual" SET DEFAULT 0,
ALTER COLUMN "ultimaAtualizacao" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Recria FKs com as novas regras de remoção
ALTER TABLE "ItemCompra" DROP CONSTRAINT "ItemCompra_compraId_fkey";
ALTER TABLE "ItemCompra" ADD CONSTRAINT "ItemCompra_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "Compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Estoque" DROP CONSTRAINT "Estoque_produtoId_fkey";
ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
