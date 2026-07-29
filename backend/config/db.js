import { PrismaClient } from '@prisma/client';

// Singleton instance of Prisma Client to manage PostgreSQL connection pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
