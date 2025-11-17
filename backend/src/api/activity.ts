import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../db/client';

export const activityApi: FastifyPluginAsync = async (fastify) => {
  // Get global community activity feed
  fastify.get('/global', async (request, reply) => {
    try {
      const { page = '1', limit = '20' } = request.query as {
        page?: string;
        limit?: string;
      };

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Get recent comments from users with public activity
      const comments = await prisma.comment.findMany({
        where: {
          user: {
            showActivity: true,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          artist: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip,
      });

      // Get recent ratings from users with public activity
      const ratings = await prisma.rating.findMany({
        where: {
          user: {
            showActivity: true,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          artist: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip,
      });

      // Get recent watchlist additions from users with public activity
      const watchlistAdds = await prisma.watchlist.findMany({
        where: {
          user: {
            showActivity: true,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          artist: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        skip,
      });

      // Combine and sort all activities by timestamp
      const allActivities = [
        ...comments.map(c => ({ type: 'comment' as const, ...c })),
        ...ratings.map(r => ({ type: 'rating' as const, ...r })),
        ...watchlistAdds.map(w => ({ type: 'watchlist' as const, ...w })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limitNum);

      return reply.send({
        success: true,
        data: allActivities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          hasMore: allActivities.length === limitNum,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch community activity',
      });
    }
  });
};
