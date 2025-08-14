import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Enhanced Prisma client with connection retry logic
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }).$extends({
    client: {
      // Retry logic for transient connection errors
      async $transaction(fn: any, options?: any) {
        let retries = 3;
        let lastError: any;
        while (retries > 0) {
          try {
            return await prisma.$transaction(fn, options);
          } catch (error: any) {
            lastError = error;
            retries--;
            if (retries === 0 || !isRetryableError(error)) {
              throw error;
            }
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, 3 - retries) * 100));
          }
        }
        throw lastError;
      },
    },
    query: {
      // Retry logic for all queries
      async $allOperations({ operation, model, args, query }: any) {
        let retries = 3;
        let lastError: any;
        while (retries > 0) {
          try {
            return await query(args);
          } catch (error: any) {
            lastError = error;
            retries--;
            if (retries === 0 || !isRetryableError(error)) {
              throw error;
            }
            // Log retry attempt in production
            if (process.env.NODE_ENV === 'production') {
              console.log(`Retrying ${model}.${operation} after connection error. Retries left: ${retries}`);
            }
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, 3 - retries) * 100));
          }
        }
        throw lastError;
      },
    },
  });

// Helper function to identify retryable errors
function isRetryableError(error: any): boolean {
  const retryableCodes = [
    'P1001', // Can't reach database server
    'P1002', // Database server timeout
    'P2024', // Connection pool timeout
  ];
  
  return error.code && retryableCodes.includes(error.code);
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;