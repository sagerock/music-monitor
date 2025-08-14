import { prisma } from '../db/client';
import PQueue from 'p-queue';
import { apifyService } from './apify';

interface FacebookStats {
  followers: number;
  likes: number;
  isVerified?: boolean;
  name?: string;
  about?: string;
  category?: string;
  profilePicUrl?: string;
}

export class FacebookService {
  private queue: PQueue;
  private lastRequestTime: Map<string, number> = new Map();

  constructor() {
    // Rate limiting for API calls
    // More lenient since Apify handles the actual scraping
    this.queue = new PQueue({
      concurrency: 2, // Can handle more concurrent requests with Apify
      interval: 5000, // 5 seconds between batches
      intervalCap: 2,
    });
  }

  /**
   * Extract page name from Facebook URL
   */
  extractPageName(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Remove trailing slash and get page name
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        // Handle both /pagename and /pages/PageName/123456 formats
        if (parts[0] === 'pages' && parts.length >= 2) {
          return parts[1];
        }
        return parts[0];
      }
      return null;
    } catch {
      // Maybe it's just a page name
      return url;
    }
  }

  /**
   * Scrape Facebook page stats
   */
  async scrapeProfile(pageNameOrUrl: string): Promise<FacebookStats | null> {
    const pageName = this.extractPageName(pageNameOrUrl);
    if (!pageName) {
      console.error('Could not extract page name from:', pageNameOrUrl);
      return null;
    }

    // Check cache (don't scrape same page within 24 hours)
    const cacheKey = `facebook:${pageName}`;
    const lastRequest = this.lastRequestTime.get(cacheKey);
    if (lastRequest && Date.now() - lastRequest < 24 * 60 * 60 * 1000) {
      console.log(`Skipping ${pageName} - scraped within last 24 hours`);
      return null;
    }

    const result = await this.queue.add(async () => {
      try {
        // Check if Apify is enabled
        if (!apifyService.isEnabled()) {
          console.log('Apify service not available - Facebook scraping disabled');
          console.log('To enable: Add APIFY_API_TOKEN to your environment variables');
          return null;
        }

        console.log(`Scraping Facebook page via Apify: ${pageName}`);
        
        // Use Apify service to scrape
        const profile = await apifyService.scrapeFacebook(pageNameOrUrl);
        
        if (!profile) {
          console.error(`Failed to scrape Facebook page: ${pageName}`);
          return null;
        }

        // Mark this page as recently scraped
        this.lastRequestTime.set(cacheKey, Date.now());

        // Convert Apify response to our format
        const stats: FacebookStats = {
          followers: profile.followersCount,
          likes: profile.likesCount,
          isVerified: profile.verified,
          name: profile.name,
          about: profile.about,
          category: profile.category,
          profilePicUrl: profile.profilePicUrl,
        };

        console.log(`✓ Scraped ${pageName}: ${stats.followers.toLocaleString()} followers, ${stats.likes.toLocaleString()} likes`);
        return stats;
      } catch (error) {
        console.error(`Error scraping Facebook page ${pageName}:`, error);
        return null;
      }
    });

    return result || null;
  }

  /**
   * Update stats for a single Facebook link
   */
  async updateFacebookStats(socialId: bigint, url: string): Promise<void> {
    try {
      const stats = await this.scrapeProfile(url);
      
      if (!stats) {
        console.log(`No stats retrieved for Facebook: ${url}`);
        return;
      }

      // Update the social link with new stats
      await prisma.artistSocial.update({
        where: { id: socialId },
        data: {
          followerCount: BigInt(stats.followers),
          verified: stats.isVerified || false,
          lastFetched: new Date(),
        },
      });

      // Create a snapshot for historical tracking
      await prisma.socialSnapshot.create({
        data: {
          artistSocialId: socialId,
          followerCount: BigInt(stats.followers),
          metrics: {
            likes: stats.likes,
            name: stats.name,
            about: stats.about,
            category: stats.category,
            profilePicUrl: stats.profilePicUrl,
          },
          snapshotDate: new Date(),
        },
      });

      console.log(`✓ Updated Facebook stats for social ID ${socialId}`);
    } catch (error) {
      console.error(`Error updating Facebook stats for ${url}:`, error);
    }
  }

  /**
   * Update all Facebook links in the database
   */
  async updateAllFacebookStats(): Promise<void> {
    try {
      console.log('Updating all Facebook page stats...');
      
      // Get all Facebook links from the database
      const facebookLinks = await prisma.artistSocial.findMany({
        where: {
          platform: 'facebook',
        },
        select: {
          id: true,
          url: true,
          artistId: true,
        },
      });

      if (facebookLinks.length === 0) {
        console.log('No Facebook links found to update');
        return;
      }

      console.log(`Found ${facebookLinks.length} Facebook links to update`);

      // Process each link
      for (const link of facebookLinks) {
        await this.updateFacebookStats(link.id, link.url);
        // Add a small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('✓ Facebook stats update completed');
    } catch (error) {
      console.error('Error updating Facebook stats:', error);
      throw error;
    }
  }

  /**
   * Check if a Facebook URL is valid
   */
  isValidFacebookUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('facebook.com');
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const facebookService = new FacebookService();