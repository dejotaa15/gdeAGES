/**
 * Cria o primeiro ADMIN. Sem ele ninguém conseguiria criar usuários,
 * já que POST /usuarios é exclusivo de ADMIN ("problema do ovo e da galinha").
 *
 * Rode com: npx prisma db seed
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@panvel.com').toLowerCase();
  const senha = process.env.ADMIN_SENHA;
  if (!senha) {
    throw new Error('Defina ADMIN_SENHA no .env antes de rodar o seed');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  try {
    const admin = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: 'Administrador',
        senha: await bcrypt.hash(senha, 10),
        cargo: 'ADMIN',
      },
    });
    console.log(`ADMIN pronto: ${admin.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
