import { FastifyInstance } from 'fastify';
import { prisma as db } from '../db/client';
import { requireAdmin, requireModerator } from '../middleware/authorization';

export async function adminApi(fastify: FastifyInstance) {
  // Get all users with pagination and filtering
  fastify.get('/users', {
    preHandler: [fastify.authenticate, requireAdmin],
  }, async (request, reply) => {
    const { page = '1', limit = '50', search = '', role, status } = request.query as any;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Search by email or name
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by role
    if (role && ['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      where.role = role;
    }

    // Filter by status
    if (status && ['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          status: true,
          statusReason: true,
          statusChangedAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              comments: true,
              ratings: true,
              watchlists: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      db.user.count({ where }),
    ]);

    return reply.send({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  });

  // Get single user details (admin view)
  fastify.get('/users/:userId', {
    preHandler: [fastify.authenticate, requireAdmin],
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            comments: true,
            ratings: true,
            watchlists: true,
            followers: true,
            following: true,
            alerts: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: 'User not found',
      });
    }

    return reply.send({
      success: true,
      data: user,
    });
  });

  // Update user role (admin only)
  fastify.patch('/users/:userId/role', {
    preHandler: [fastify.authenticate, requireAdmin],
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { role } = request.body as { role: 'USER' | 'MODERATOR' | 'ADMIN' };
    const adminUser = (request as any).user;

    if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid role. Must be USER, MODERATOR, or ADMIN',
      });
    }

    // Prevent admin from demoting themselves
    if (userId === adminUser.id && role !== 'ADMIN') {
      return reply.status(400).send({
        success: false,
        error: 'You cannot change your own admin role',
      });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return reply.send({
      success: true,
      data: user,
      message: `User role updated to ${role}`,
    });
  });

  // Suspend user (moderators and admins)
  fastify.post('/users/:userId/suspend', {
    preHandler: [fastify.authenticate, requireModerator],
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { reason } = request.body as { reason?: string; duration?: number };
    const adminUser = (request as any).user;

    // Prevent suspending yourself
    if (userId === adminUser.id) {
      return reply.status(400).send({
        success: false,
        error: 'You cannot suspend your own account',
      });
    }

    // Check if target user is an admin (only admins can suspend admins)
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true },
    });

    if (targetUser?.role === 'ADMIN') {
      const currentUser = await db.user.findUnique({
        where: { id: adminUser.id },
        select: { role: true },
      });

      if (currentUser?.role !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Only admins can suspend other admins',
        });
      }
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
        statusReason: reason || 'No reason provided',
        statusChangedAt: new Date(),
        statusChangedBy: adminUser.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        statusReason: true,
      },
    });

    return reply.send({
      success: true,
      data: user,
      message: 'User suspended',
    });
  });

  // Ban user (admin only)
  fastify.post('/users/:userId/ban', {
    preHandler: [fastify.authenticate, requireAdmin],
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { reason } = request.body as { reason?: string };
    const adminUser = (request as any).user;

    // Prevent banning yourself
    if (userId === adminUser.id) {
      return reply.status(400).send({
        success: false,
        error: 'You cannot ban your own account',
      });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        status: 'BANNED',
        statusReason: reason || 'No reason provided',
        statusChangedAt: new Date(),
        statusChangedBy: adminUser.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        statusReason: true,
      },
    });

    return reply.send({
      success: true,
      data: user,
      message: 'User banned',
    });
  });

  // Unsuspend/unban user (admin only)
  fastify.post('/users/:userId/activate', {
    preHandler: [fastify.authenticate, requireAdmin],
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const adminUser = (request as any).user;

    const user = await db.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        statusReason: null,
        statusChangedAt: new Date(),
        statusChangedBy: adminUser.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    });

    return reply.send({
      success: true,
      data: user,
      message: 'User account activated',
    });
  });

  // Delete user (admin only)
  fastify.delete('/users/:userId', {
    preHandler: [fastify.authenticate, requireAdmin],
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const adminUser = (request as any).user;

    // Prevent deleting yourself
    if (userId === adminUser.id) {
      return reply.status(400).send({
        success: false,
        error: 'You cannot delete your own account',
      });
    }

    // Delete user and all their data (cascading)
    await db.user.delete({
      where: { id: userId },
    });

    return reply.send({
      success: true,
      message: 'User and all associated data deleted',
    });
  });

  // Delete comment (moderators and admins)
  fastify.delete('/comments/:commentId', {
    preHandler: [fastify.authenticate, requireModerator],
  }, async (_request, reply) => {
    const { commentId } = _request.params as { commentId: string };

    await db.comment.delete({
      where: { id: commentId },
    });

    return reply.send({
      success: true,
      message: 'Comment deleted',
    });
  });

  // Delete rating (moderators and admins)
  fastify.delete('/ratings/:ratingId', {
    preHandler: [fastify.authenticate, requireModerator],
  }, async (_request, reply) => {
    const { ratingId } = _request.params as { ratingId: string };

    await db.rating.delete({
      where: { id: ratingId },
    });

    return reply.send({
      success: true,
      message: 'Rating deleted',
    });
  });

  // Get platform stats (admin only)
  fastify.get('/stats', {
    preHandler: [fastify.authenticate, requireAdmin],
  }, async (_request, reply) => {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      totalComments,
      totalRatings,
      totalArtists,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { status: 'ACTIVE' } }),
      db.user.count({ where: { status: 'SUSPENDED' } }),
      db.user.count({ where: { status: 'BANNED' } }),
      db.comment.count(),
      db.rating.count(),
      db.artist.count(),
    ]);

    return reply.send({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          banned: bannedUsers,
        },
        content: {
          comments: totalComments,
          ratings: totalRatings,
          artists: totalArtists,
        },
      },
    });
  });
}
