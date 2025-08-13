import { google, youtube_v3 } from 'googleapis';
import { config } from '../config';
import { prisma } from '../db/client';
import PQueue from 'p-queue';

interface YouTubeChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  title: string;
  description?: string;
  customUrl?: string;
  thumbnailUrl?: string;
}

export class YouTubeService {
  private youtube: youtube_v3.Youtube;
  private queue: PQueue;

  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: config.YOUTUBE_API_KEY,
    });

    // Rate limiting: YouTube API allows 10,000 units per day
    // Channel stats cost 3 units each
    // Let's be conservative and do max 100 requests per hour
    this.queue = new PQueue({
      concurrency: 1,
      interval: 36000, // 36 seconds between requests (100 per hour)
      intervalCap: 1,
    });
  }

  /**
   * Extract channel ID from various YouTube URL formats
   */
  extractChannelId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Direct channel ID: /channel/UC...
      if (pathname.startsWith('/channel/')) {
        return pathname.split('/')[2];
      }

      // Handle: /@username
      if (pathname.startsWith('/@')) {
        // We'll need to resolve this to a channel ID
        return null; // Will handle with search
      }

      // Custom URL: /c/customname
      if (pathname.startsWith('/c/')) {
        return null; // Will handle with search
      }

      // Legacy user: /user/username
      if (pathname.startsWith('/user/')) {
        return null; // Will handle with search
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch channel statistics from YouTube API
   */
  async fetchChannelStats(channelIdOrUrl: string): Promise<YouTubeChannelStats | null> {
    if (!config.YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured');
      return null;
    }

    return this.queue.add(async () => {
      try {
        let channelId = this.extractChannelId(channelIdOrUrl);
        
        // If we couldn't extract a channel ID, try to search for it
        if (!channelId && channelIdOrUrl.includes('youtube.com')) {
          const urlObj = new URL(channelIdOrUrl);
          const pathname = urlObj.pathname;
          
          if (pathname.startsWith('/@')) {
            // Search by handle
            const handle = pathname.substring(2);
            const searchResponse = await this.youtube.search.list({
              part: ['snippet'],
              q: handle,
              type: ['channel'],
              maxResults: 1,
            });
            
            if (searchResponse.data.items?.[0]) {
              channelId = searchResponse.data.items[0].snippet?.channelId || null;
            }
          } else if (pathname.startsWith('/c/') || pathname.startsWith('/user/')) {
            // Search by custom URL or username
            const name = pathname.split('/')[2];
            const searchResponse = await this.youtube.search.list({
              part: ['snippet'],
              q: name,
              type: ['channel'],
              maxResults: 1,
            });
            
            if (searchResponse.data.items?.[0]) {
              channelId = searchResponse.data.items[0].snippet?.channelId || null;
            }
          }
        } else if (!channelId) {
          // Assume it's a channel ID directly
          channelId = channelIdOrUrl;
        }

        if (!channelId) {
          console.error('Could not determine channel ID from:', channelIdOrUrl);
          return null;
        }

        // Fetch channel details
        const response = await this.youtube.channels.list({
          part: ['statistics', 'snippet'],
          id: [channelId],
        });

        const channel = response.data.items?.[0];
        if (!channel) {
          console.error('Channel not found:', channelId);
          return null;
        }

        const stats = channel.statistics;
        const snippet = channel.snippet;

        return {
          subscriberCount: parseInt(stats?.subscriberCount || '0'),
          viewCount: parseInt(stats?.viewCount || '0'),
          videoCount: parseInt(stats?.videoCount || '0'),
          title: snippet?.title || '',
          description: snippet?.description,
          customUrl: snippet?.customUrl,
          thumbnailUrl: snippet?.thumbnails?.default?.url,
        };
      } catch (error) {
        console.error('Error fetching YouTube channel stats:', error);
        return null;
      }
    });
  }

  /**
   * Update stats for all YouTube social links
   */
  async updateAllYouTubeStats(): Promise<void> {
    console.log('Starting YouTube stats update...');
    
    const youtubeSocials = await prisma.artistSocial.findMany({
      where: {
        platform: 'youtube',
      },
      include: {
        artist: true,
      },
    });

    console.log(`Found ${youtubeSocials.length} YouTube channels to update`);

    let successCount = 0;
    let errorCount = 0;

    for (const social of youtubeSocials) {
      try {
        // Check if we've updated recently (within last 23 hours)
        if (social.lastFetched) {
          const hoursSinceLastFetch = (Date.now() - social.lastFetched.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastFetch < 23) {
            console.log(`Skipping ${social.artist.name} - recently updated`);
            continue;
          }
        }

        const stats = await this.fetchChannelStats(social.channelId || social.url);
        
        if (stats) {
          // Update the social link with current stats
          await prisma.artistSocial.update({
            where: { id: social.id },
            data: {
              followerCount: BigInt(stats.subscriberCount),
              lastFetched: new Date(),
              // Update channel ID if we resolved it from URL
              channelId: social.channelId || this.extractChannelId(social.url),
            },
          });

          // Create a snapshot for historical tracking
          await prisma.socialSnapshot.create({
            data: {
              artistSocialId: social.id,
              snapshotDate: new Date(),
              followerCount: BigInt(stats.subscriberCount),
              postCount: stats.videoCount,
              metrics: {
                views: stats.viewCount,
                title: stats.title,
                description: stats.description,
                customUrl: stats.customUrl,
                thumbnailUrl: stats.thumbnailUrl,
              },
            },
          });

          console.log(`✓ Updated ${social.artist.name}: ${stats.subscriberCount.toLocaleString()} subscribers`);
          successCount++;
        } else {
          console.log(`✗ Failed to fetch stats for ${social.artist.name}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error updating ${social.artist.name}:`, error);
        errorCount++;
      }
    }

    console.log(`YouTube stats update complete: ${successCount} successful, ${errorCount} errors`);
  }

  /**
   * Calculate growth rate between two snapshots
   */
  async calculateGrowthRate(artistSocialId: bigint, days: number = 7): Promise<number | null> {
    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const snapshots = await prisma.socialSnapshot.findMany({
      where: {
        artistSocialId,
        snapshotDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { snapshotDate: 'asc' },
      take: 2,
    });

    if (snapshots.length < 2) {
      return null;
    }

    const [oldSnapshot, newSnapshot] = snapshots;
    if (!oldSnapshot.followerCount || !newSnapshot.followerCount) {
      return null;
    }

    const oldCount = Number(oldSnapshot.followerCount);
    const newCount = Number(newSnapshot.followerCount);
    
    if (oldCount === 0) return null;
    
    return ((newCount - oldCount) / oldCount) * 100;
  }
}

export const youtubeService = new YouTubeService();