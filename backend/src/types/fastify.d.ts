import 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId?: string;
      id: string;
      email: string;
      name?: string | null;
      username?: string | null;
      bio?: string | null;
      avatar?: string | null;
      isPrivate?: boolean;
      createdAt?: Date;
      updatedAt?: Date;
    };
  }
  
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; id?: string; email?: string };
    user: {
      userId: string;
      id: string;
      email?: string;
    };
  }
}