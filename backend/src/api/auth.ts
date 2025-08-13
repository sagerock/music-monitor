import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/client';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  clerkId: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
});

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/register', async (request, reply) => {
    try {
      const { email, name, clerkId } = registerSchema.parse(request.body);

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          error: 'User already exists',
        });
      }

      const user = await prisma.user.create({
        data: {
          email,
          name,
          clerkId,
        },
      });

      const token = fastify.jwt.sign({
        userId: user.id,
        id: user.id,
        email: user.email,
      });

      return reply.send({
        success: true,
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to register user',
      });
    }
  });

  fastify.post('/login', async (request, reply) => {
    try {
      const { email } = loginSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found',
        });
      }

      const token = fastify.jwt.sign({
        userId: user.id,
        id: user.id,
        email: user.email,
      });

      return reply.send({
        success: true,
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to login',
      });
    }
  });

  fastify.post('/verify', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const userId = request.user.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to verify user',
      });
    }
  });

  fastify.post('/clerk-webhook', async (request, reply) => {
    try {
      const { data, type } = request.body as any;

      if (type === 'user.created' || type === 'user.updated') {
        const { id, email_addresses, first_name, last_name } = data;
        const primaryEmail = email_addresses.find((e: any) => e.primary);

        if (primaryEmail) {
          await prisma.user.upsert({
            where: { clerkId: id },
            update: {
              email: primaryEmail.email_address,
              name: [first_name, last_name].filter(Boolean).join(' ') || null,
            },
            create: {
              clerkId: id,
              email: primaryEmail.email_address,
              name: [first_name, last_name].filter(Boolean).join(' ') || null,
            },
          });
        }
      }

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Webhook processing failed',
      });
    }
  });
};