import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/client';

const watchlistBodySchema = z.object({
  artistId: z.string(),
});

const watchlistParamsSchema = z.object({
  artistId: z.string(),
});

export const watchlistRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const userId = request.user.id;
      
      const watchlist = await prisma.watchlist.findMany({
        where: { userId },
        include: {
          artist: {
            include: {
              snapshots: {
                orderBy: { snapshotDate: 'desc' },
                take: 2,
              },
            },
          },
        },
      });

      const watchlistWithMomentum = watchlist.map(item => {
        const [current, previous] = item.artist.snapshots;
        
        let momentumChange = 0;
        if (current && previous) {
          const popChange = (current.popularity || 0) - (previous.popularity || 0);
          const followerChange = previous.followers && previous.followers > 0n
            ? Number(current.followers || 0n - previous.followers) / Number(previous.followers)
            : 0;
          momentumChange = popChange + followerChange * 50;
        }

        // Convert BigInt fields to strings for JSON serialization
        return {
          ...item,
          artist: {
            ...item.artist,
            followers: item.artist.followers ? item.artist.followers.toString() : null,
            snapshots: item.artist.snapshots.map(s => ({
              ...s,
              id: s.id.toString(),
              followers: s.followers ? s.followers.toString() : null,
            })),
          },
          momentumChange,
        };
      });

      return reply.send({
        success: true,
        data: watchlistWithMomentum,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch watchlist',
      });
    }
  });

  fastify.post('/', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const userId = request.user.id;
      const { artistId } = watchlistBodySchema.parse(request.body);

      const artist = await prisma.artist.findUnique({
        where: { id: artistId },
      });

      if (!artist) {
        return reply.status(404).send({
          success: false,
          error: 'Artist not found',
        });
      }

      const existing = await prisma.watchlist.findUnique({
        where: {
          userId_artistId: {
            userId,
            artistId,
          },
        },
      });

      if (existing) {
        return reply.status(400).send({
          success: false,
          error: 'Artist already in watchlist',
        });
      }

      const watchlistItem = await prisma.watchlist.create({
        data: {
          userId,
          artistId,
        },
        include: {
          artist: true,
        },
      });

      return reply.send({
        success: true,
        data: watchlistItem,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to add to watchlist',
      });
    }
  });

  fastify.delete('/:artistId', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const userId = request.user.id;
      const { artistId } = watchlistParamsSchema.parse(request.params);

      await prisma.watchlist.delete({
        where: {
          userId_artistId: {
            userId,
            artistId,
          },
        },
      });

      return reply.send({
        success: true,
        message: 'Removed from watchlist',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to remove from watchlist',
      });
    }
  });
};