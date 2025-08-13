import { chromium, Browser } from 'playwright';
import { prisma } from '../db/client';
import PQueue from 'p-queue';

interface InstagramStats {
  followers: number;
  following: number;
  posts: number;
}

export class SimpleInstagramService {
  private queue: PQueue;
  private browser: Browser | null = null;

  constructor() {
    this.queue = new PQueue({
      concurrency: 1,
      interval: 10000,
      intervalCap: 1,
    });
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  extractUsername(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        return parts[0].replace('@', '');
      }
    } catch {
      return url.replace('@', '').replace('/', '');
    }
    return null;
  }

  async scrapeProfile(usernameOrUrl: string): Promise<InstagramStats | null> {
    const username = this.extractUsername(usernameOrUrl);
    if (!username) {
      console.error('Could not extract username from:', usernameOrUrl);
      return null;
    }

    const result = await this.queue.add(async () => {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      
      try {
        console.log(`Scraping Instagram profile: @${username}`);
        
        const url = `https://www.instagram.com/${username}/`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Try to get from meta tag first (most reliable)
        const metaContent = await page.$eval(
          'meta[property="og:description"]',
          (el) => el.getAttribute('content') || ''
        ).catch(() => '');

        let followers = 0;
        let following = 0;
        let posts = 0;

        if (metaContent) {
          // Parse meta content like "1.2M Followers, 500 Following, 1,234 Posts"
          const followersMatch = metaContent.match(/([\d,\.]+[KMB]?)\s*Followers/i);
          const followingMatch = metaContent.match(/([\d,\.]+[KMB]?)\s*Following/i);
          const postsMatch = metaContent.match(/([\d,\.]+[KMB]?)\s*Posts/i);

          if (followersMatch) followers = this.parseNumber(followersMatch[1]);
          if (followingMatch) following = this.parseNumber(followingMatch[1]);
          if (postsMatch) posts = this.parseNumber(postsMatch[1]);
        }

        // If meta tag failed, try to find in page content
        if (followers === 0) {
          const pageContent = await page.content();
          
          // Look for patterns like "123K followers"
          const patterns = [
            /"edge_followed_by":\{"count":(\d+)\}/,
            /(\d+(?:,\d{3})*(?:\.\d+)?[KMB]?)\s*followers/i,
            /"followerCount":(\d+)/,
          ];

          for (const pattern of patterns) {
            const match = pageContent.match(pattern);
            if (match) {
              followers = this.parseNumber(match[1]);
              if (followers > 0) break;
            }
          }
        }

        console.log(`✓ Scraped @${username}: ${followers} followers`);
        return { followers, following, posts };

      } catch (error) {
        console.error(`Error scraping Instagram @${username}:`, error);
        return null;
      } finally {
        await page.close();
      }
    });
    
    return result || null;
  }

  private parseNumber(str: string): number {
    str = str.replace(/,/g, '');
    if (str.endsWith('K')) return parseFloat(str) * 1000;
    if (str.endsWith('M')) return parseFloat(str) * 1000000;
    if (str.endsWith('B')) return parseFloat(str) * 1000000000;
    return parseInt(str) || 0;
  }

  async updateAllInstagramStats(): Promise<void> {
    console.log('Starting Instagram stats update...');
    
    const instagramSocials = await prisma.artistSocial.findMany({
      where: { platform: 'instagram' },
      include: { artist: true },
    });

    console.log(`Found ${instagramSocials.length} Instagram profiles to update`);

    let successCount = 0;
    let errorCount = 0;

    for (const social of instagramSocials) {
      try {
        const stats = await this.scrapeProfile(social.handle || social.url);
        
        if (stats && stats.followers > 0) {
          await prisma.artistSocial.update({
            where: { id: social.id },
            data: {
              followerCount: BigInt(stats.followers),
              lastFetched: new Date(),
            },
          });

          await prisma.socialSnapshot.create({
            data: {
              artistSocialId: social.id,
              snapshotDate: new Date(),
              followerCount: BigInt(stats.followers),
              followingCount: BigInt(stats.following),
              postCount: stats.posts,
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

    console.log(`Instagram stats update complete: ${successCount} successful, ${errorCount} errors`);
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const simpleInstagramService = new SimpleInstagramService();