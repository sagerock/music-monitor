import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/client';

const createCommentSchema = z.object({
  artistId: z.string(),
  content: z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export async function commentsApi(fastify: FastifyInstance) {
  // Get comments for an artist
  fastify.get('/artist/:artistId', async (request, _reply) => {
    const { artistId } = request.params as { artistId: string };
    const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute queries sequentially to avoid connection pool exhaustion
    const comments = await prisma.comment.findMany({
      where: { 
        artistId,
        parentId: null, // Only get top-level comments
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    const total = await prisma.comment.count({
      where: { 
        artistId,
        parentId: null,
      },
    });

    return {
      data: comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  });

  // Create a comment (requires auth)
  fastify.post(
    '/',
    { preValidation: [fastify.authenticate] },
    async (request, _reply) => {
      const data = createCommentSchema.parse(request.body);
      const userId = request.user.userId || request.user.id;

      const comment = await prisma.comment.create({
        data: {
          ...data,
          userId,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          replies: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      return { data: comment };
    }
  );

  // Update a comment (requires auth, must be author)
  fastify.put(
    '/:id',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const data = updateCommentSchema.parse(request.body);
      const userId = request.user.userId || request.user.id;

      // Check if user owns the comment
      const existingComment = await prisma.comment.findUnique({
        where: { id },
      });

      if (!existingComment) {
        return reply.code(404).send({ error: 'Comment not found' });
      }

      if (existingComment.userId !== userId) {
        return reply.code(403).send({ error: 'You can only edit your own comments' });
      }

      const comment = await prisma.comment.update({
        where: { id },
        data,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return { data: comment };
    }
  );

  // Delete a comment (requires auth, must be author)
  fastify.delete(
    '/:id',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = request.user.userId || request.user.id;

      // Check if user owns the comment
      const existingComment = await prisma.comment.findUnique({
        where: { id },
      });

      if (!existingComment) {
        return reply.code(404).send({ error: 'Comment not found' });
      }

      if (existingComment.userId !== userId) {
        return reply.code(403).send({ error: 'You can only delete your own comments' });
      }

      await prisma.comment.delete({
        where: { id },
      });

      return { success: true };
    }
  );
}