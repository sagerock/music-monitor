import { chromium, Browser, Page } from 'playwright';
import { prisma } from '../db/client';
import PQueue from 'p-queue';

interface InstagramStats {
  followers: number;
  following: number;
  posts: number;
  isVerified?: boolean;
  bio?: string;
  profilePicUrl?: string;
}

export class InstagramService {
  private queue: PQueue;
  private browser: Browser | null = null;
  private lastRequestTime: Map<string, number> = new Map();

  constructor() {
    // Conservative rate limiting for Instagram
    // Max 1 request every 10 seconds to avoid detection
    this.queue = new PQueue({
      concurrency: 1,
      interval: 10000, // 10 seconds between requests
      intervalCap: 1,
    });
  }

  /**
   * Get or create browser instance
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins,site-per-process',
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
        // Use the full chromium browser, not headless shell
        channel: undefined,
      });
    }
    return this.browser;
  }

  /**
   * Extract username from Instagram URL
   */
  extractUsername(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Remove trailing slash and get username
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0 && !parts[0].startsWith('p')) {
        return parts[0];
      }
      return null;
    } catch {
      // Maybe it's just a username
      return url.replace('@', '');
    }
  }

  /**
   * Scrape Instagram profile stats
   */
  async scrapeProfile(usernameOrUrl: string): Promise<InstagramStats | null> {
    const username = this.extractUsername(usernameOrUrl);
    if (!username) {
      console.error('Could not extract username from:', usernameOrUrl);
      return null;
    }

    // Check cache (don't scrape same profile within 24 hours)
    const cacheKey = `instagram:${username}`;
    const lastRequest = this.lastRequestTime.get(cacheKey);
    if (lastRequest && Date.now() - lastRequest < 24 * 60 * 60 * 1000) {
      console.log(`Skipping ${username} - scraped within last 24 hours`);
      return null;
    }

    const result = await this.queue.add(async () => {
      let page: Page | null = null;
      
      try {
        const browser = await this.getBrowser();
        page = await browser.newPage();

        // Set realistic user agent and viewport
        await page.setExtraHTTPHeaders({
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        // Add some randomness to viewport
        await page.setViewportSize({
          width: 1280 + Math.floor(Math.random() * 100),
          height: 720 + Math.floor(Math.random() * 100),
        });

        console.log(`Scraping Instagram profile: @${username}`);
        
        // Navigate to profile
        const url = `https://www.instagram.com/${username}/`;
        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });

        // Wait for content to load
        await page.waitForTimeout(2000 + Math.random() * 2000);

        // Check if profile exists
        const notFound = await page.$('text="Sorry, this page isn\'t available."');
        if (notFound) {
          console.error(`Profile not found: @${username}`);
          return null;
        }

        // Extract data from the page
        const stats = await page.evaluate(() => {
          declare const document: any; // Browser global
          const parseInstagramNumber = (str: string): number => {
            str = str.replace(/,/g, '');
            if (str.endsWith('K')) {
              return parseFloat(str) * 1000;
            } else if (str.endsWith('M')) {
              return parseFloat(str) * 1000000;
            } else if (str.endsWith('B')) {
              return parseFloat(str) * 1000000000;
            }
            return parseInt(str) || 0;
          };

          // Try to find stats in various ways
          const findStat = (text: string): number => {
            const elements = document.querySelectorAll('span, div');
            for (const el of elements) {
              const content = el.textContent || '';
              if (content.includes(text)) {
                // Look for the number in the same element or parent
                const parent = el.parentElement;
                if (parent) {
                  const numbers = parent.textContent?.match(/[\d,]+(?:\.\d+)?[KMB]?/);
                  if (numbers) {
                    return parseInstagramNumber(numbers[0]);
                  }
                }
              }
            }
            return 0;
          };

          // Try multiple selectors for stats
          let followers = 0;
          let following = 0;
          let posts = 0;

          // Method 1: Look for meta tags
          const followersMetaTag = document.querySelector('meta[property="og:description"]');
          if (followersMetaTag) {
            const content = followersMetaTag.getAttribute('content') || '';
            const match = content.match(/([\d,\.]+[KMB]?)\s*Followers/i);
            if (match) {
              followers = parseInstagramNumber(match[1]);
            }
            const followingMatch = content.match(/([\d,\.]+[KMB]?)\s*Following/i);
            if (followingMatch) {
              following = parseInstagramNumber(followingMatch[1]);
            }
            const postsMatch = content.match(/([\d,\.]+[KMB]?)\s*Posts/i);
            if (postsMatch) {
              posts = parseInstagramNumber(postsMatch[1]);
            }
          }

          // Method 2: Look for specific text patterns
          if (followers === 0) {
            followers = findStat('followers');
          }
          if (following === 0) {
            following = findStat('following');
          }
          if (posts === 0) {
            posts = findStat('posts');
          }

          // Get bio
          const bioElement = document.querySelector('div.-vDIg span') || 
                            document.querySelector('header section div:nth-child(3)');
          const bio = bioElement?.textContent?.trim();

          // Check verification
          const isVerified = !!document.querySelector('svg[aria-label="Verified"]');

          // Get profile pic
          const profilePicElement = document.querySelector('header img');
          const profilePicUrl = profilePicElement?.getAttribute('src');

          return {
            followers,
            following,
            posts,
            bio,
            isVerified,
            profilePicUrl,
          };
        });

        // Mark this profile as recently scraped
        this.lastRequestTime.set(cacheKey, Date.now());

        console.log(`✓ Scraped @${username}: ${stats.followers} followers`);
        return stats;

      } catch (error) {
        console.error(`Error scraping Instagram @${username}:`, error);
        return null;
      } finally {
        if (page) {
          await page.close();
        }
      }
    });
    
    return result || null;
  }

  /**
   * Update all Instagram profiles in the database
   */
  async updateAllInstagramStats(): Promise<void> {
    console.log('Starting Instagram stats update...');
    
    const instagramSocials = await prisma.artistSocial.findMany({
      where: {
        platform: 'instagram',
      },
      include: {
        artist: true,
      },
    });

    console.log(`Found ${instagramSocials.length} Instagram profiles to update`);

    let successCount = 0;
    let errorCount = 0;

    for (const social of instagramSocials) {
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
            },
          });

          // Create a snapshot for historical tracking
          await prisma.socialSnapshot.create({
            data: {
              artistSocialId: social.id,
              snapshotDate: new Date(),
              followerCount: BigInt(stats.followers),
              followingCount: BigInt(stats.following),
              postCount: stats.posts,
              metrics: {
                bio: stats.bio,
                isVerified: stats.isVerified,
                profilePicUrl: stats.profilePicUrl,
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

    console.log(`Instagram stats update complete: ${successCount} successful, ${errorCount} errors`);
  }

  /**
   * Cleanup browser instance
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const instagramService = new InstagramService();