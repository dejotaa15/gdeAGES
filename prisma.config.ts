import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },

  datasource: {
    // Conexão direta (sem pooler) — usada pelas migrations
    url: env('DIRECT_URL'),
  },
});
