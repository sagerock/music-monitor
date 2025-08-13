import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/client';

const platformEnum = z.enum(['youtube', 'instagram', 'tiktok', 'twitter', 'facebook']);

const addSocialSchema = z.object({
  artistId: z.string(),
  platform: platformEnum,
  url: z.string().url(),
});

const updateSocialSchema = z.object({
  verified: z.boolean().optional(),
});

// Helper to extract handle/channel ID from URLs
function extractSocialHandle(url: string, platform: string): { handle?: string; channelId?: string } {
  try {
    const urlObj = new URL(url);
    
    switch (platform) {
      case 'youtube':
        // YouTube URLs can be:
        // https://www.youtube.com/channel/UC... (channel ID)
        // https://www.youtube.com/@handle
        // https://www.youtube.com/c/customname
        // https://www.youtube.com/user/username
        if (urlObj.pathname.startsWith('/channel/')) {
          return { channelId: urlObj.pathname.split('/')[2] };
        } else if (urlObj.pathname.startsWith('/@')) {
          return { handle: urlObj.pathname.substring(2) };
        } else if (urlObj.pathname.startsWith('/c/')) {
          return { handle: urlObj.pathname.split('/')[2] };
        } else if (urlObj.pathname.startsWith('/user/')) {
          return { handle: urlObj.pathname.split('/')[2] };
        }
        break;
        
      case 'instagram':
        // https://www.instagram.com/username/
        return { handle: urlObj.pathname.split('/').filter(Boolean)[0] };
        
      case 'tiktok':
        // https://www.tiktok.com/@username
        if (urlObj.pathname.startsWith('/@')) {
          return { handle: urlObj.pathname.substring(2) };
        }
        break;
        
      case 'twitter':
        // https://twitter.com/username or https://x.com/username
        return { handle: urlObj.pathname.split('/').filter(Boolean)[0] };
        
      case 'facebook':
        // https://www.facebook.com/artistname
        return { handle: urlObj.pathname.split('/').filter(Boolean)[0] };
    }
  } catch (error) {
    // Invalid URL
  }
  
  return {};
}

export const socialsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all social links for an artist
  fastify.get('/artist/:artistId', async (request, reply) => {
    const { artistId } = request.params as { artistId: string };
    
    try {
      const socials = await prisma.artistSocial.findMany({
        where: { artistId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          snapshots: {
            orderBy: { snapshotDate: 'desc' },
            take: 2, // Get last 2 snapshots to calculate growth
          },
        },
        orderBy: { platform: 'asc' },
      });
      
      // Convert BigInt to string and calculate growth for JSON serialization
      const serializedSocials = await Promise.all(socials.map(async (social) => {
        let growthRate = null;
        
        // Calculate growth rate if we have 2 snapshots
        if (social.snapshots.length >= 2) {
          const [recent, previous] = social.snapshots;
          if (recent.followerCount && previous.followerCount) {
            const recentCount = Number(recent.followerCount);
            const previousCount = Number(previous.followerCount);
            if (previousCount > 0) {
              growthRate = ((recentCount - previousCount) / previousCount) * 100;
            }
          }
        }
        
        return {
          ...social,
          id: social.id.toString(),
          followerCount: social.followerCount?.toString() || null,
          growthRate,
          snapshots: undefined, // Don't include raw snapshots in response
        };
      }));
      
      return reply.send({
        success: true,
        data: serializedSocials,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch social links',
      });
    }
  });
  
  // Add a social link for an artist
  fastify.post('/', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    try {
      const { artistId, platform, url } = addSocialSchema.parse(request.body);
      const userId = request.user.id;
      
      // Check if artist exists
      const artist = await prisma.artist.findUnique({
        where: { id: artistId },
      });
      
      if (!artist) {
        return reply.status(404).send({
          success: false,
          error: 'Artist not found',
        });
      }
      
      // Check if this platform link already exists
      const existing = await prisma.artistSocial.findUnique({
        where: {
          artistId_platform: {
            artistId,
            platform,
          },
        },
      });
      
      if (existing) {
        return reply.status(400).send({
          success: false,
          error: `${platform} link already exists for this artist`,
        });
      }
      
      // Extract handle/channel ID from URL
      const { handle, channelId } = extractSocialHandle(url, platform);
      
      // Create the social link
      const social = await prisma.artistSocial.create({
        data: {
          artistId,
          platform,
          url,
          handle,
          channelId,
          addedBy: userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      // Convert BigInt to string
      const serializedSocial = {
        ...social,
        id: social.id.toString(),
        followerCount: social.followerCount?.toString() || null,
      };
      
      return reply.send({
        success: true,
        data: serializedSocial,
        message: `${platform} link added successfully`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        });
      }
      
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to add social link',
      });
    }
  });
  
  // Update a social link (e.g., mark as verified)
  fastify.patch('/:id', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      const data = updateSocialSchema.parse(request.body);
      
      const social = await prisma.artistSocial.update({
        where: { id: BigInt(id) },
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      const serializedSocial = {
        ...social,
        id: social.id.toString(),
        followerCount: social.followerCount?.toString() || null,
      };
      
      return reply.send({
        success: true,
        data: serializedSocial,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update social link',
      });
    }
  });
  
  // Delete a social link
  fastify.delete('/:id', {
    preHandler: fastify.authenticate,
  }, async (request: any, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.id;
    
    try {
      // Check if the social link exists and was added by this user
      const social = await prisma.artistSocial.findUnique({
        where: { id: BigInt(id) },
      });
      
      if (!social) {
        return reply.status(404).send({
          success: false,
          error: 'Social link not found',
        });
      }
      
      // Only allow deletion by the user who added it (or implement admin check)
      if (social.addedBy !== userId) {
        return reply.status(403).send({
          success: false,
          error: 'You can only delete social links you added',
        });
      }
      
      await prisma.artistSocial.delete({
        where: { id: BigInt(id) },
      });
      
      return reply.send({
        success: true,
        message: 'Social link deleted successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to delete social link',
      });
    }
  });
};