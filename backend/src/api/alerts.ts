import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/client';

const alertBodySchema = z.object({
  artistId: z.string(),
  threshold: z.number().min(0).max(100),
});

const alertUpdateSchema = z.object({
  threshold: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

const alertParamsSchema = z.object({
  id: z.string().transform(Number),
});

export const alertRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const userId = request.user.id;
      
      const alerts = await prisma.alert.findMany({
        where: { userId },
        include: {
          artist: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Convert BigInt fields to strings for JSON serialization
      const serializedAlerts = alerts.map((alert: any) => ({
        ...alert,
        id: alert.id.toString(),
        artist: {
          ...alert.artist,
          followers: alert.artist.followers ? alert.artist.followers.toString() : null,
        },
      }));

      return reply.send({
        success: true,
        data: serializedAlerts,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch alerts',
      });
    }
  });

  fastify.post('/', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const userId = request.user.id;
      const { artistId, threshold } = alertBodySchema.parse(request.body);

      const artist = await prisma.artist.findUnique({
        where: { id: artistId },
      });

      if (!artist) {
        return reply.status(404).send({
          success: false,
          error: 'Artist not found',
        });
      }

      const existing = await prisma.alert.findFirst({
        where: {
          userId,
          artistId,
          isActive: true,
        },
      });

      if (existing) {
        return reply.status(400).send({
          success: false,
          error: 'Active alert already exists for this artist',
        });
      }

      const alert = await prisma.alert.create({
        data: {
          userId,
          artistId,
          threshold,
        },
        include: {
          artist: true,
        },
      });

      return reply.send({
        success: true,
        data: alert,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create alert',
      });
    }
  });

  fastify.patch('/:id', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const userId = request.user.id;
      const { id } = alertParamsSchema.parse(request.params);
      const updates = alertUpdateSchema.parse(request.body);

      const alert = await prisma.alert.findFirst({
        where: {
          id: BigInt(id),
          userId,
        },
      });

      if (!alert) {
        return reply.status(404).send({
          success: false,
          error: 'Alert not found',
        });
      }

      const updated = await prisma.alert.update({
        where: { id: BigInt(id) },
        data: updates,
        include: {
          artist: true,
        },
      });

      return reply.send({
        success: true,
        data: updated,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update alert',
      });
    }
  });

  fastify.delete('/:id', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const userId = request.user.id;
      const { id } = alertParamsSchema.parse(request.params);

      const alert = await prisma.alert.findFirst({
        where: {
          id: BigInt(id),
          userId,
        },
      });

      if (!alert) {
        return reply.status(404).send({
          success: false,
          error: 'Alert not found',
        });
      }

      await prisma.alert.delete({
        where: { id: BigInt(id) },
      });

      return reply.send({
        success: true,
        message: 'Alert deleted successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete alert',
      });
    }
  });
};