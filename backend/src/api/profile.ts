import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/client';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal('')),
  twitter: z.string().max(50).optional().nullable(),
  instagram: z.string().max(50).optional().nullable(),
  tiktok: z.string().max(50).optional().nullable(),
  youtube: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  // Privacy settings
  isPublic: z.boolean().optional(),
  showActivity: z.boolean().optional(),
  showWatchlist: z.boolean().optional(),
  allowFollowers: z.boolean().optional(),
});

export async function profileApi(fastify: FastifyInstance) {
  // Get current user's profile
  fastify.get(
    '/me',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const userId = request.user.userId || request.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          bio: true,
          avatarUrl: true,
          twitter: true,
          instagram: true,
          tiktok: true,
          youtube: true,
          website: true,
          isPublic: true,
          showActivity: true,
          showWatchlist: true,
          allowFollowers: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              watchlists: true,
              comments: true,
              ratings: true,
              followers: true,
              following: true,
            },
          },
        },
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return { data: user };
    }
  );

  // Get any user's public profile (respects privacy settings)
  fastify.get('/user/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    
    // Get viewer ID if authenticated
    let viewerId: string | null = null;
    try {
      await request.jwtVerify();
      viewerId = request.user.userId || request.user.id;
    } catch {
      // Not authenticated, that's okay
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        twitter: true,
        instagram: true,
        tiktok: true,
        youtube: true,
        website: true,
        isPublic: true,
        showActivity: true,
        showWatchlist: true,
        allowFollowers: true,
        createdAt: true,
        _count: {
          select: {
            watchlists: true,
            comments: true,
            ratings: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    // Check if viewer is the profile owner
    const isOwner = viewerId === userId;

    // Check if viewer is following this user
    let isFollowing = false;
    if (viewerId && !isOwner) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    // If profile is private and viewer is not owner or follower, limit data
    if (!user.isPublic && !isOwner && !isFollowing) {
      return {
        data: {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          isPublic: false,
          allowFollowers: user.allowFollowers,
          _count: {
            followers: user._count.followers,
            following: user._count.following,
          },
        },
        isLimited: true,
      };
    }

    // Filter activity counts based on privacy settings
    const profileData = {
      ...user,
      _count: {
        ...user._count,
        watchlists: user.showWatchlist || isOwner ? user._count.watchlists : null,
        comments: user.showActivity || isOwner ? user._count.comments : null,
        ratings: user.showActivity || isOwner ? user._count.ratings : null,
      },
    };

    return { 
      data: profileData,
      isFollowing,
      isOwner,
    };
  });

  // Update current user's profile
  fastify.put(
    '/me',
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const userId = request.user.userId || request.user.id;
      const data = updateProfileSchema.parse(request.body);

      // Clean the data - convert empty strings to null
      const cleanedData: any = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value === '') {
          cleanedData[key] = null;
        } else if (value !== undefined) {
          cleanedData[key] = value;
        }
      });

      const user = await prisma.user.update({
        where: { id: userId },
        data: cleanedData,
        select: {
          id: true,
          email: true,
          name: true,
          bio: true,
          avatarUrl: true,
          twitter: true,
          instagram: true,
          tiktok: true,
          youtube: true,
          website: true,
          isPublic: true,
          showActivity: true,
          showWatchlist: true,
          allowFollowers: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { data: user };
    }
  );

  // Get user's recent activity (comments and ratings) - respects privacy
  fastify.get(
    '/activity/:userId',
    async (request, reply) => {
      const { userId } = request.params as { userId: string };
      const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string };

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Get viewer ID if authenticated
      let viewerId: string | null = null;
      try {
        await request.jwtVerify();
        viewerId = request.user.userId || request.user.id;
      } catch {
        // Not authenticated
      }

      // Check privacy settings
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          isPublic: true,
          showActivity: true,
        },
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const isOwner = viewerId === userId;

      // Check if viewer can see activity
      if (!user.showActivity && !isOwner) {
        // Check if following (for private profiles)
        if (!user.isPublic && viewerId) {
          const follow = await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: viewerId,
                followingId: userId,
              },
            },
          });
          if (!follow) {
            return reply.code(403).send({ error: 'This user\'s activity is private' });
          }
        } else if (!user.isPublic) {
          return reply.code(403).send({ error: 'This user\'s activity is private' });
        }
      }

      // Get recent comments
      const [comments, commentsTotal] = await Promise.all([
        prisma.comment.findMany({
          where: { userId },
          include: {
            artist: {
              select: { id: true, name: true, imageUrl: true },
            },
            parent: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limitNum,
          skip,
        }),
        prisma.comment.count({ where: { userId } }),
      ]);

      // Get recent ratings
      const [ratings, ratingsTotal] = await Promise.all([
        prisma.rating.findMany({
          where: { userId },
          include: {
            artist: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limitNum,
          skip,
        }),
        prisma.rating.count({ where: { userId } }),
      ]);

      return {
        data: {
          comments,
          ratings,
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          commentsTotal,
          ratingsTotal,
        },
      };
    }
  );

  // Get user's watchlist - respects privacy
  fastify.get(
    '/watchlist/:userId',
    async (request, reply) => {
      const { userId } = request.params as { userId: string };

      // Get viewer ID if authenticated
      let viewerId: string | null = null;
      try {
        await request.jwtVerify();
        viewerId = request.user.userId || request.user.id;
      } catch {
        // Not authenticated
      }

      // Check privacy settings
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          isPublic: true,
          showWatchlist: true,
        },
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const isOwner = viewerId === userId;

      // Check if viewer can see watchlist
      if (!user.showWatchlist && !isOwner) {
        // Check if following (for private profiles)
        if (!user.isPublic && viewerId) {
          const follow = await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: viewerId,
                followingId: userId,
              },
            },
          });
          if (!follow) {
            return reply.code(403).send({ error: 'This user\'s watchlist is private' });
          }
        } else if (!user.isPublic) {
          return reply.code(403).send({ error: 'This user\'s watchlist is private' });
        }
      }

      const watchlist = await prisma.watchlist.findMany({
        where: { userId },
        include: {
          artist: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              genres: true,
              followers: true,
              popularity: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Convert BigInt followers to number for JSON serialization
      const artists = watchlist.map(w => ({
        ...w.artist,
        followers: w.artist.followers ? Number(w.artist.followers) : null,
      }));

      return { data: artists };
    }
  );
}