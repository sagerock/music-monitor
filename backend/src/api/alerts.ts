import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/client';

const alertBodySchema = z.object({
  artistId: z.string(),
  alertType: z.enum(['momentum', 'comment', 'rating']).default('momentum'),
  threshold: z.number().min(0).max(100).optional(),
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
        alertType: alert.alertType || 'momentum', // Default to momentum for old alerts
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
      const { artistId, alertType, threshold } = alertBodySchema.parse(request.body);

      // Validate threshold is provided for momentum alerts
      if (alertType === 'momentum' && threshold === undefined) {
        return reply.status(400).send({
          success: false,
          error: 'Threshold is required for momentum alerts',
        });
      }

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
          alertType,
          isActive: true,
        },
      });

      if (existing) {
        return reply.status(400).send({
          success: false,
          error: `Active ${alertType} alert already exists for this artist`,
        });
      }

      const alert = await prisma.alert.create({
        data: {
          userId,
          artistId,
          alertType: alertType || 'momentum',
          threshold: alertType === 'momentum' ? threshold : null,
        },
        include: {
          artist: true,
        },
      });

      // Serialize BigInt fields
      const serializedAlert = {
        ...alert,
        id: alert.id.toString(),
        artist: {
          ...alert.artist,
          followers: alert.artist.followers ? alert.artist.followers.toString() : null,
        },
      };

      return reply.send({
        success: true,
        data: serializedAlert,
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

      // Serialize BigInt fields
      const serializedAlert = {
        ...updated,
        id: updated.id.toString(),
        artist: {
          ...updated.artist,
          followers: updated.artist.followers ? updated.artist.followers.toString() : null,
        },
      };

      return reply.send({
        success: true,
        data: serializedAlert,
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