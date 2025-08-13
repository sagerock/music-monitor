import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { momentumService } from '../services/momentum';

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
      const artists = await momentumService.calculateMomentum(
        genres,
        query.days,
        query.limit
      );

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