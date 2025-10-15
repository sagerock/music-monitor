import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { config } from './config';
import { artistRoutes } from './api/artists';
import { leaderboardRoutes } from './api/leaderboard';
import { watchlistRoutes } from './api/watchlist';
import { alertRoutes } from './api/alerts';
import { jobRoutes } from './api/jobs';
import { authRoutes } from './api/auth';
import { searchRoutes } from './api/search';
import { socialsRoutes } from './api/socials';
import { commentsApi } from './api/comments';
import { ratingsApi } from './api/ratings';
import { profileApi } from './api/profile';
import { followsApi } from './api/follows';
import { uploadApi } from './api/upload';
import { notificationsApi } from './api/notifications';
import { startCronJobs } from './jobs';
import { authenticateSupabase } from './auth/supabase';
import { setupMonitoring } from './middleware/monitoring';

const fastify = Fastify({
  logger: config.NODE_ENV === 'production' 
    ? {
        level: config.LOG_LEVEL,
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            headers: {
              host: req.headers.host,
              'user-agent': req.headers['user-agent'],
              'content-type': req.headers['content-type'],
            },
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      }
    : {
        level: config.LOG_LEVEL,
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      },
});

async function start() {
  try {
    await fastify.register(cors, {
      origin: config.NODE_ENV === 'production'
        ? config.FRONTEND_URL
        : config.FRONTEND_URL,
      credentials: true,
    });

    await fastify.register(jwt, {
      secret: config.JWT_SECRET,
    });

    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    await fastify.register(multipart, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1,
      },
    });

    // Setup monitoring and health checks
    await setupMonitoring(fastify);

    fastify.decorate('authenticate', async function (request: any, reply: any) {
      // Check if it's a Supabase token
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        // Supabase tokens are JWTs but much longer than our simple tokens
        if (token.length > 100) {
          return authenticateSupabase(request, reply);
        }
      }
      
      // Fall back to old JWT auth for backwards compatibility
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({
          success: false,
          error: 'Authentication required'
        });
      }
    });

    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(artistRoutes, { prefix: '/api/artists' });
    await fastify.register(leaderboardRoutes, { prefix: '/api/leaderboard' });
    await fastify.register(watchlistRoutes, { prefix: '/api/watchlist' });
    await fastify.register(alertRoutes, { prefix: '/api/alerts' });
    await fastify.register(jobRoutes, { prefix: '/api/jobs' });
    await fastify.register(searchRoutes, { prefix: '/api/search' });
    await fastify.register(socialsRoutes, { prefix: '/api/socials' });
    await fastify.register(commentsApi, { prefix: '/api/comments' });
    await fastify.register(ratingsApi, { prefix: '/api/ratings' });
    await fastify.register(profileApi, { prefix: '/api/profile' });
    await fastify.register(followsApi, { prefix: '/api/follows' });
    await fastify.register(uploadApi, { prefix: '/api/upload' });
    await fastify.register(notificationsApi, { prefix: '/api/notifications' });

    if (config.NODE_ENV === 'production') {
      startCronJobs();
    }

    await fastify.listen({ 
      port: config.PORT, 
      host: '0.0.0.0' 
    });
    
    fastify.log.info(`🚀 Server running on port ${config.PORT}`);
    fastify.log.info(`📡 Environment: ${config.NODE_ENV}`);
    fastify.log.info(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Global error handlers
process.on('uncaughtException', (err) => {
  fastify.log.error({ err }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  fastify.log.error({ err }, 'Unhandled rejection');
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await fastify.close();
    fastify.log.info('Server closed successfully');
    process.exit(0);
  } catch (err) {
    fastify.log.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

start();