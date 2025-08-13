import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { config } from '../config';
import { refreshNewReleases } from '../jobs/refresh-new-releases';
import { snapshotArtists } from '../jobs/snapshot-artists';
import { checkAlerts } from '../jobs/check-alerts';
import { updateSocialStats } from '../jobs/update-social-stats';

const jobAuthSchema = z.object({
  secret: z.string(),
});

export const jobRoutes: FastifyPluginAsync = async (fastify) => {
  const authenticateJob = async (request: any, reply: any) => {
    try {
      const { secret } = jobAuthSchema.parse(request.headers);
      
      if (secret !== config.CRON_JOB_SECRET) {
        return reply.status(401).send({
          success: false,
          error: 'Unauthorized',
        });
      }
    } catch (error) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid job secret',
      });
    }
  };

  fastify.post('/refresh-new-releases', {
    preHandler: authenticateJob,
  }, async (_request, reply) => {
    try {
      const result = await refreshNewReleases();
      
      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to refresh new releases',
      });
    }
  });

  fastify.post('/snapshot-artists', {
    preHandler: authenticateJob,
  }, async (_request, reply) => {
    try {
      const result = await snapshotArtists();
      
      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to snapshot artists',
      });
    }
  });

  fastify.post('/check-alerts', {
    preHandler: authenticateJob,
  }, async (_request, reply) => {
    try {
      const result = await checkAlerts();
      
      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to check alerts',
      });
    }
  });

  fastify.post('/update-social-stats', {
    preHandler: authenticateJob,
  }, async (_request, reply) => {
    try {
      await updateSocialStats();
      
      return reply.send({
        success: true,
        message: 'Social stats update started',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update social stats',
      });
    }
  });

  fastify.get('/status', async (_request, reply) => {
    try {
      const { prisma } = await import('../db/client');
      
      const recentJobs = await prisma.jobLog.findMany({
        orderBy: { startedAt: 'desc' },
        take: 10,
      });

      return reply.send({
        success: true,
        data: recentJobs,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch job status',
      });
    }
  });
};