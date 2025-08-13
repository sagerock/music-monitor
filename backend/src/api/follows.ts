import { FastifyInstance } from 'fastify';
import { prisma } from '../db/client';

export async function followsApi(fastify: FastifyInstance) {
  // Follow or request to follow a user
  fastify.post(
    '/follow/:userId',
    { preValidation: [fastify.authenticate] },
    async (request, _reply) => {
      const { userId: targetId } = request.params as { userId: string };
      const followerId = request.user.userId || request.user.id;

      if (followerId === targetId) {
        return _reply.code(400).send({ error: 'Cannot follow yourself' });
      }

      // Check if already following
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId: targetId,
          },
        },
      });

      if (existingFollow) {
        return _reply.code(400).send({ error: 'Already following this user' });
      }

      // Get target user's privacy settings
      const targetUser = await prisma.user.findUnique({
        where: { id: targetId },
        select: { isPublic: true, allowFollowers: true },
      });

      if (!targetUser) {
        return _reply.code(404).send({ error: 'User not found' });
      }

      if (!targetUser.allowFollowers) {
        return _reply.code(403).send({ error: 'This user does not allow followers' });
      }

      // If user is public, create follow directly
      if (targetUser.isPublic) {
        const follow = await prisma.follow.create({
          data: {
            followerId,
            followingId: targetId,
          },
        });

        // Create notification for the followed user
        await prisma.notification.create({
          data: {
            userId: targetId,
            type: 'follow',
            title: 'New Follower',
            message: 'Someone started following you',
            data: { followerId },
          },
        });

        return { data: follow, status: 'following' };
      }

      // If user is private, check for existing request
      const existingRequest = await prisma.followRequest.findUnique({
        where: {
          requesterId_targetId: {
            requesterId: followerId,
            targetId,
          },
        },
      });

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          return _reply.code(400).send({ error: 'Follow request already pending' });
        }
        if (existingRequest.status === 'rejected') {
          // Update the request to pending
          await prisma.followRequest.update({
            where: { id: existingRequest.id },
            data: { status: 'pending', updatedAt: new Date() },
          });
          return { data: existingRequest, status: 'requested' };
        }
      }

      // Create follow request
      const followRequest = await prisma.followRequest.create({
        data: {
          requesterId: followerId,
          targetId,
        },
      });

      // Create notification for follow request
      await prisma.notification.create({
        data: {
          userId: targetId,
          type: 'follow_request',
          title: 'New Follow Request',
          message: 'Someone requested to follow you',
          data: { requesterId: followerId },
        },
      });

      return { data: followRequest, status: 'requested' };
    }
  );

  // Unfollow a user
  fastify.delete(
    '/unfollow/:userId',
    { preValidation: [fastify.authenticate] },
    async (request, _reply) => {
      const { userId: targetId } = request.params as { userId: string };
      const followerId = request.user.userId || request.user.id;

      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId: targetId,
          },
        },
      });

      if (!follow) {
        return _reply.code(404).send({ error: 'Not following this user' });
      }

      await prisma.follow.delete({
        where: { id: follow.id },
      });

      return { success: true };
    }
  );

  // Get user's followers
  fastify.get('/followers/:userId', async (request, _reply) => {
    const { userId } = request.params as { userId: string };
    const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string };
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              bio: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.follow.count({ where: { followingId: userId } }),
    ]);

    return {
      data: followers.map((f: any) => f.follower),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  });

  // Get user's following
  fastify.get('/following/:userId', async (request, _reply) => {
    const { userId } = request.params as { userId: string };
    const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string };
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              bio: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      data: following.map((f: any) => f.following),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  });

  // Get follow status between current user and target user
  fastify.get(
    '/status/:userId',
    { preValidation: [fastify.authenticate] },
    async (request, _reply) => {
      const { userId: targetId } = request.params as { userId: string };
      const followerId = request.user.userId || request.user.id;

      // Check if following
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId: targetId,
          },
        },
      });

      if (follow) {
        return { status: 'following' };
      }

      // Check if request pending
      const followReq = await prisma.followRequest.findUnique({
        where: {
          requesterId_targetId: {
            requesterId: followerId,
            targetId,
          },
        },
      });

      if (followReq) {
        return { status: followReq.status === 'pending' ? 'requested' : 'none' };
      }

      return { status: 'none' };
    }
  );

  // Get pending follow requests for current user
  fastify.get(
    '/requests',
    { preValidation: [fastify.authenticate] },
    async (request, _reply) => {
      const userId = request.user.userId || request.user.id;
      const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string };
      
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const [requests, total] = await Promise.all([
        prisma.followRequest.findMany({
          where: {
            targetId: userId,
            status: 'pending',
          },
          include: {
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                bio: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.followRequest.count({
          where: {
            targetId: userId,
            status: 'pending',
          },
        }),
      ]);

      return {
        data: requests,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    }
  );

  // Approve follow request
  fastify.post(
    '/requests/:requestId/approve',
    { preValidation: [fastify.authenticate] },
    async (request, _reply) => {
      const { requestId } = request.params as { requestId: string };
      const userId = request.user.userId || request.user.id;

      const followRequest = await prisma.followRequest.findUnique({
        where: { id: requestId },
      });

      if (!followRequest) {
        return _reply.code(404).send({ error: 'Request not found' });
      }

      if (followRequest.targetId !== userId) {
        return _reply.code(403).send({ error: 'Not authorized to approve this request' });
      }

      if (followRequest.status !== 'pending') {
        return _reply.code(400).send({ error: 'Request is not pending' });
      }

      // Update request status
      await prisma.followRequest.update({
        where: { id: requestId },
        data: { status: 'approved' },
      });

      // Create the follow relationship
      const follow = await prisma.follow.create({
        data: {
          followerId: followRequest.requesterId,
          followingId: followRequest.targetId,
        },
      });

      // Notify the requester
      await prisma.notification.create({
        data: {
          userId: followRequest.requesterId,
          type: 'follow_approved',
          title: 'Follow Request Approved',
          message: 'Your follow request was approved',
          data: { targetId: followRequest.targetId },
        },
      });

      return { data: follow };
    }
  );

  // Reject follow request
  fastify.post(
    '/requests/:requestId/reject',
    { preValidation: [fastify.authenticate] },
    async (request, _reply) => {
      const { requestId } = request.params as { requestId: string };
      const userId = request.user.userId || request.user.id;

      const followRequest = await prisma.followRequest.findUnique({
        where: { id: requestId },
      });

      if (!followRequest) {
        return _reply.code(404).send({ error: 'Request not found' });
      }

      if (followRequest.targetId !== userId) {
        return _reply.code(403).send({ error: 'Not authorized to reject this request' });
      }

      if (followRequest.status !== 'pending') {
        return _reply.code(400).send({ error: 'Request is not pending' });
      }

      // Update request status
      await prisma.followRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });

      return { success: true };
    }
  );

  // Cancel follow request
  fastify.delete(
    '/requests/:userId',
    { preValidation: [fastify.authenticate] },
    async (request, _reply) => {
      const { userId: targetId } = request.params as { userId: string };
      const requesterId = request.user.userId || request.user.id;

      const cancelRequest = await prisma.followRequest.findUnique({
        where: {
          requesterId_targetId: {
            requesterId,
            targetId,
          },
        },
      });

      if (!cancelRequest || cancelRequest.status !== 'pending') {
        return _reply.code(404).send({ error: 'No pending request found' });
      }

      await prisma.followRequest.delete({
        where: { id: cancelRequest.id },
      });

      return { success: true };
    }
  );

  // Get follow counts for a user
  fastify.get('/counts/:userId', async (request, _reply) => {
    const { userId } = request.params as { userId: string };

    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      followers: followersCount,
      following: followingCount,
    };
  });
}