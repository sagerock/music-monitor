import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';
import { cache } from '../utils/cache';

/**
 * Monitoring middleware for database and cache health
 */

interface HealthMetrics {
  timestamp: string;
  database: {
    connected: boolean;
    poolSize?: number;
    error?: string;
  };
  cache: {
    size: number;
    keys: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 60000; // Check every minute

export async function setupMonitoring(fastify: FastifyInstance) {
  // Add health check endpoint
  fastify.get('/api/health', async (_request, reply) => {
    const metrics = await getHealthMetrics();
    
    // Return 503 if database is not connected
    const statusCode = metrics.database.connected ? 200 : 503;
    
    return reply.status(statusCode).send(metrics);
  });

  // Add monitoring hook
  fastify.addHook('onRequest', async (request, _reply) => {
    const now = Date.now();
    
    // Log health metrics periodically (every minute)
    if (now - lastHealthCheck > HEALTH_CHECK_INTERVAL) {
      lastHealthCheck = now;
      
      const metrics = await getHealthMetrics();
      
      // Log in production
      if (process.env.NODE_ENV === 'production') {
        fastify.log.info({
          type: 'health_metrics',
          ...metrics,
        });
      }
      
      // Warn if memory usage is high
      const memoryUsagePercent = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
      if (memoryUsagePercent > 90) {
        fastify.log.warn({
          type: 'high_memory_usage',
          percent: memoryUsagePercent.toFixed(2),
          heapUsed: metrics.memory.heapUsed,
          heapTotal: metrics.memory.heapTotal,
        });
      }
      
      // Warn if cache is getting large
      if (metrics.cache.keys > 1000) {
        fastify.log.warn({
          type: 'large_cache_size',
          cacheKeys: metrics.cache.keys,
        });
      }
    }
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development') {
      const start = Date.now();
      request.raw.on('end', () => {
        const duration = Date.now() - start;
        if (duration > 1000) {
          fastify.log.warn({
            type: 'slow_request',
            method: request.method,
            url: request.url,
            duration,
          });
        }
      });
    }
  });
}

async function getHealthMetrics(): Promise<HealthMetrics> {
  const memUsage = process.memoryUsage();
  const cacheStats = cache.getStats();
  
  // Test database connection
  let dbConnected = false;
  let dbError: string | undefined;
  
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (error: any) {
    dbConnected = false;
    dbError = error.message || 'Database connection failed';
  }
  
  return {
    timestamp: new Date().toISOString(),
    database: {
      connected: dbConnected,
      ...(dbError && { error: dbError }),
    },
    cache: {
      size: cacheStats.size,
      keys: cacheStats.keys.length,
    },
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
    },
  };
}

// Export a function to manually check pool stats (can be called from jobs)
export async function logPoolStats(context: string) {
  try {
    const metrics = await getHealthMetrics();
    console.log(`[${context}] Pool Stats:`, {
      database: metrics.database,
      cache: metrics.cache,
      memory: `${metrics.memory.heapUsed}/${metrics.memory.heapTotal} MB`,
    });
  } catch (error) {
    console.error(`[${context}] Failed to get pool stats:`, error);
  }
}