import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/client';

const markReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAll: z.boolean().optional(),
});

export const notificationsApi: FastifyPluginAsync = async (fastify) => {
  // Get user's notifications
  fastify.get('/', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const userId = request.user.id;
      const { page = '1', limit = '20', unreadOnly = 'false' } = request.query as { 
        page?: string; 
        limit?: string; 
        unreadOnly?: string;
      };

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;
      const showUnreadOnly = unreadOnly === 'true';

      const where = {
        userId,
        ...(showUnreadOnly && { read: false }),
      };

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({ 
          where: { userId, read: false } 
        }),
      ]);

      return reply.send({
        success: true,
        data: {
          notifications,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
          unreadCount,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch notifications',
      });
    }
  });

  // Mark notifications as read
  fastify.post('/mark-read', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const userId = request.user.id;
      const { notificationIds, markAll } = markReadSchema.parse(request.body);

      if (markAll) {
        // Mark all notifications as read
        await prisma.notification.updateMany({
          where: {
            userId,
            read: false,
          },
          data: {
            read: true,
          },
        });
      } else if (notificationIds && notificationIds.length > 0) {
        // Mark specific notifications as read
        await prisma.notification.updateMany({
          where: {
            id: { in: notificationIds },
            userId, // Ensure user owns these notifications
            read: false,
          },
          data: {
            read: true,
          },
        });
      }

      return reply.send({
        success: true,
        message: 'Notifications marked as read',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to mark notifications as read',
      });
    }
  });

  // Delete a notification
  fastify.delete('/:id', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const userId = request.user.id;
      const { id } = request.params as { id: string };

      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!notification) {
        return reply.status(404).send({
          success: false,
          error: 'Notification not found',
        });
      }

      await prisma.notification.delete({
        where: { id },
      });

      return reply.send({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete notification',
      });
    }
  });

  // Get unread count
  fastify.get('/unread-count', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const userId = request.user.id;
      
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });

      return reply.send({
        success: true,
        data: { count },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get unread count',
      });
    }
  });
};