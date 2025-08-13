import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/client';

const createRatingSchema = z.object({
  artistId: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().max(5000).optional(),
});

// updateRatingSchema removed - was unused

export async function ratingsApi(fastify: FastifyInstance) {
  // Get ratings for an artist
  fastify.get('/artist/:artistId', async (request, _reply) => {
    const { artistId } = request.params as { artistId: string };
    const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [ratings, total, stats] = await Promise.all([
      prisma.rating.findMany({
        where: { artistId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.rating.count({
        where: { artistId },
      }),
      prisma.rating.aggregate({
        where: { artistId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    // Get rating distribution
    const distribution = await prisma.rating.groupBy({
      by: ['rating'],
      where: { artistId },
      _count: { rating: true },
    });

    const distributionMap: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    distribution.forEach((d: any) => {
      distributionMap[d.rating] = d._count.rating;
    });

    return {
      data: ratings,
      stats: {
        average: stats._avg.rating || 0,
        total: stats._count.rating,
        distribution: distributionMap,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  });

  // Get user's rating for an artist
  fastify.get(
    '/artist/:artistId/user',
    { preValidation: [fastify.authenticate] },
    async (request, _reply) => {
      const { artistId } = request.params as { artistId: string };
      const userId = request.user.userId || request.user.id;

      const rating = await prisma.rating.findUnique({
        where: {
          artistId_userId: {
            artistId,
            userId,
          },
        },
      });

      return { data: rating };
    }
  );

  // Create or update a rating (requires auth)
  fastify.post(
    '/',
    { preValidation: [fastify.authenticate] },
    async (request, _reply) => {
      const data = createRatingSchema.parse(request.body);
      const userId = request.user.userId || request.user.id;

      const rating = await prisma.rating.upsert({
        where: {
          artistId_userId: {
            artistId: data.artistId,
            userId,
          },
        },
        update: {
          rating: data.rating,
          review: data.review,
          updatedAt: new Date(),
        },
        create: {
          ...data,
          userId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return { data: rating };
    }
  );

  // Delete a rating (requires auth, must be author)
  fastify.delete(
    '/artist/:artistId',
    { preValidation: [fastify.authenticate] },
    async (request, _reply) => {
      const { artistId } = request.params as { artistId: string };
      const userId = request.user.userId || request.user.id;

      const existingRating = await prisma.rating.findUnique({
        where: {
          artistId_userId: {
            artistId,
            userId,
          },
        },
      });

      if (!existingRating) {
        return reply.code(404).send({ error: 'Rating not found' });
      }

      await prisma.rating.delete({
        where: {
          artistId_userId: {
            artistId,
            userId,
          },
        },
      });

      return { success: true };
    }
  );

  // Get top rated artists
  fastify.get('/top-rated', async (request, _reply) => {
    const { limit = '10' } = request.query as { limit?: string };
    const limitNum = parseInt(limit, 10);

    const topRated = await prisma.rating.groupBy({
      by: ['artistId'],
      _avg: { rating: true },
      _count: { rating: true },
      having: {
        rating: {
          _count: {
            gte: 3, // At least 3 ratings
          },
        },
      },
      orderBy: {
        _avg: {
          rating: 'desc',
        },
      },
      take: limitNum,
    });

    // Get artist details
    const artistIds = topRated.map((r: any) => r.artistId);
    const artists = await prisma.artist.findMany({
      where: { id: { in: artistIds } },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        genres: true,
      },
    });

    const artistMap = new Map(artists.map((a: any) => [a.id, a]));

    const results = topRated.map((r: any) => ({
      artist: artistMap.get(r.artistId),
      averageRating: r._avg.rating,
      totalRatings: r._count.rating,
    }));

    return { data: results };
  });
}