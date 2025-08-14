import { prisma } from '../db/client';
import PQueue from 'p-queue';
import { apifyService } from './apify';

interface TwitterStats {
  followers: number;
  following: number;
  tweets: number;
  isVerified?: boolean;
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export class TwitterService {
  private queue: PQueue;
  private lastRequestTime: Map<string, number> = new Map();

  constructor() {
    // Rate limiting for API calls
    this.queue = new PQueue({
      concurrency: 2,
      interval: 5000, // 5 seconds between batches
      intervalCap: 2,
    });
  }

  /**
   * Extract username from Twitter URL
   */
  extractUsername(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Twitter URLs are typically /username or /@username
      // X.com uses the same format
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        return parts[0].replace('@', '');
      }
      return null;
    } catch {
      // Maybe it's just a username
      return url.replace('@', '');
    }
  }

  /**
   * Scrape Twitter profile stats
   */
  async scrapeProfile(usernameOrUrl: string): Promise<TwitterStats | null> {
    const username = this.extractUsername(usernameOrUrl);
    if (!username) {
      console.error('Could not extract username from:', usernameOrUrl);
      return null;
    }

    // Check cache (don't scrape same profile within 24 hours)
    const cacheKey = `twitter:${username}`;
    const lastRequest = this.lastRequestTime.get(cacheKey);
    if (lastRequest && Date.now() - lastRequest < 24 * 60 * 60 * 1000) {
      console.log(`Skipping ${username} - scraped within last 24 hours`);
      return null;
    }

    const result = await this.queue.add(async () => {
      try {
        // Check if Apify is enabled
        if (!apifyService.isEnabled()) {
          console.log('Apify service not available - Twitter scraping disabled');
          console.log('To enable: Add APIFY_API_TOKEN to your environment variables');
          return null;
        }

        console.log(`Scraping Twitter profile via Apify: @${username}`);
        
        // Use Apify service to scrape
        const profile = await apifyService.scrapeTwitter(username);
        
        if (!profile) {
          console.error(`Failed to scrape Twitter profile: @${username}`);
          return null;
        }

        // Mark this profile as recently scraped
        this.lastRequestTime.set(cacheKey, Date.now());

        // Convert Apify response to our format
        const stats: TwitterStats = {
          followers: profile.followersCount,
          following: profile.followingCount,
          tweets: profile.tweetsCount,
          isVerified: profile.verified,
          name: profile.name,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
        };

        console.log(`✓ Scraped @${username}: ${stats.followers.toLocaleString()} followers`);
        return stats;

      } catch (error) {
        console.error(`Error scraping Twitter @${username}:`, error);
        return null;
      }
    });
    
    return result || null;
  }

  /**
   * Update all Twitter profiles in the database
   */
  async updateAllTwitterStats(): Promise<void> {
    console.log('Starting Twitter stats update...');
    
    const twitterSocials = await prisma.artistSocial.findMany({
      where: {
        platform: 'twitter',
      },
      include: {
        artist: true,
      },
    });

    console.log(`Found ${twitterSocials.length} Twitter profiles to update`);

    let successCount = 0;
    let errorCount = 0;

    for (const social of twitterSocials) {
      try {
        // Check if we've updated recently (within last 23 hours)
        if (social.lastFetched) {
          const hoursSinceLastFetch = (Date.now() - social.lastFetched.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastFetch < 23) {
            console.log(`Skipping ${social.artist.name} - recently updated`);
            continue;
          }
        }

        const stats = await this.scrapeProfile(social.handle || social.url);
        
        if (stats && stats.followers > 0) {
          // Update the social link with current stats
          await prisma.artistSocial.update({
            where: { id: social.id },
            data: {
              followerCount: BigInt(stats.followers),
              lastFetched: new Date(),
              verified: stats.isVerified,
            },
          });

          // Create a snapshot for historical tracking
          await prisma.socialSnapshot.create({
            data: {
              artistSocialId: social.id,
              snapshotDate: new Date(),
              followerCount: BigInt(stats.followers),
              followingCount: BigInt(stats.following),
              postCount: stats.tweets,
              metrics: {
                name: stats.name,
                bio: stats.bio,
                isVerified: stats.isVerified,
                avatarUrl: stats.avatarUrl,
              },
            },
          });

          console.log(`✓ Updated ${social.artist.name}: ${stats.followers.toLocaleString()} followers`);
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

    console.log(`Twitter stats update complete: ${successCount} successful, ${errorCount} errors`);
  }
}

export const twitterService = new TwitterService();