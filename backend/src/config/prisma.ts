import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from './logger';

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
});

// Handle Prisma connection errors gracefully
prisma.$connect().catch((error) => {
  logger.error({ error }, 'Failed to connect to database');
});

process.on('beforeExit', async () => {
  logger.info('Disconnecting Prisma');
  await prisma.$disconnect();
});

