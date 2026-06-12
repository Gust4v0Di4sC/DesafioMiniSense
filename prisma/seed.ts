import { PrismaClient } from '@prisma/client';
import { seedDemoData } from '../src/prisma/seed-data';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ??
        process.env.MINISENSE_DATABASE_URL ??
        'file:../data/minisense.sqlite',
    },
  },
});

async function main(): Promise<void> {
  await seedDemoData(prisma);
}

main()
  .then(() => {
    console.log('Seed MiniSense concluído.');
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
