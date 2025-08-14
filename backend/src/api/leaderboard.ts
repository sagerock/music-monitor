import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { momentumService } from '../services/momentum';
import { cache, getCacheKey } from '../utils/cache';

const leaderboardQuerySchema = z.object({
  genres: z.string().optional(),
  days: z.string().default('14').transform(Number),
  limit: z.string().default('50').transform(Number),
  country: z.string().optional(),
});

export const leaderboardRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    try {
      const query = leaderboardQuerySchema.parse(request.query);
      const genres = query.genres ? query.genres.split(',') : [];
      
      // Generate cache key based on query parameters
      const cacheKey = getCacheKey('leaderboard', {
        genres: genres.join(','),
        days: query.days,
        limit: query.limit,
      });

      // Use cache wrapper to automatically handle caching
      const artists = await cache.wrap(
        cacheKey,
        async () => {
          // Log cache miss in development
          if (process.env.NODE_ENV === 'development') {
            fastify.log.info(`Cache miss for leaderboard: ${cacheKey}`);
          }
          return await momentumService.calculateMomentum(
            genres,
            query.days,
            query.limit
          );
        },
        5 * 60 * 1000 // Cache for 5 minutes
      );

      // Log cache stats periodically in production
      if (process.env.NODE_ENV === 'production' && Math.random() < 0.01) {
        const stats = cache.getStats();
        fastify.log.info({ cacheStats: stats }, 'Cache statistics');
      }

      return reply.send({
        success: true,
        data: artists,
        meta: {
          genres,
          days: query.days,
          limit: query.limit,
          total: artists.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
      });
    }
  });
};