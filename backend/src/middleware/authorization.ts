import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma as db } from '../db/client';

/**
 * Check if user account is active
 */
export async function requireActiveUser(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user?.id;

  if (!userId) {
    return reply.status(401).send({
      success: false,
      error: 'Authentication required',
    });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });

  if (!user) {
    return reply.status(401).send({
      success: false,
      error: 'User not found',
    });
  }

  if (user.status === 'SUSPENDED') {
    return reply.status(403).send({
      success: false,
      error: 'Your account has been suspended. Please contact support.',
    });
  }

  if (user.status === 'BANNED') {
    return reply.status(403).send({
      success: false,
      error: 'Your account has been banned.',
    });
  }
}

/**
 * Require user to be a moderator or admin
 */
export async function requireModerator(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user?.id;

  if (!userId) {
    return reply.status(401).send({
      success: false,
      error: 'Authentication required',
    });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  });

  if (!user) {
    return reply.status(401).send({
      success: false,
      error: 'User not found',
    });
  }

  // Check account status
  if (user.status !== 'ACTIVE') {
    return reply.status(403).send({
      success: false,
      error: 'Your account is not active',
    });
  }

  // Check role
  if (user.role !== 'MODERATOR' && user.role !== 'ADMIN') {
    return reply.status(403).send({
      success: false,
      error: 'Moderator access required',
    });
  }
}

/**
 * Require user to be an admin
 */
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user?.id;

  if (!userId) {
    return reply.status(401).send({
      success: false,
      error: 'Authentication required',
    });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  });

  if (!user) {
    return reply.status(401).send({
      success: false,
      error: 'User not found',
    });
  }

  // Check account status
  if (user.status !== 'ACTIVE') {
    return reply.status(403).send({
      success: false,
      error: 'Your account is not active',
    });
  }

  // Check role
  if (user.role !== 'ADMIN') {
    return reply.status(403).send({
      success: false,
      error: 'Admin access required',
    });
  }
}

/**
 * Get current user's role and status
 */
export async function getUserRoleAndStatus(userId: string) {
  return await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      status: true,
      email: true,
      name: true,
    },
  });
}

/**
 * Check if user has admin or moderator role
 */
export function isStaff(role: string): boolean {
  return role === 'ADMIN' || role === 'MODERATOR';
}

/**
 * Check if user is admin
 */
export function isAdmin(role: string): boolean {
  return role === 'ADMIN';
}
