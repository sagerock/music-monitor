import { ApifyClient } from 'apify-client';

interface InstagramProfile {
  username: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  verified: boolean;
  biography?: string;
  profilePicUrl?: string;
}

interface YouTubeChannel {
  channelId: string;
  title: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  description?: string;
  thumbnailUrl?: string;
}

interface TikTokProfile {
  username: string;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  videoCount: number;
  verified: boolean;
  nickname?: string;
  avatarUrl?: string;
}

interface TwitterProfile {
  username: string;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  verified: boolean;
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export class ApifyService {
  private client: ApifyClient | null = null;
  private enabled: boolean = false;

  constructor() {
    // Only initialize if API token is provided
    if (process.env.APIFY_API_TOKEN) {
      this.client = new ApifyClient({
        token: process.env.APIFY_API_TOKEN,
      });
      this.enabled = true;
      console.log('Apify service initialized');
    } else {
      console.log('Apify service disabled - no API token provided');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async scrapeInstagram(username: string): Promise<InstagramProfile | null> {
    if (!this.client) {
      console.log('Apify client not initialized');
      return null;
    }

    try {
      console.log(`Scraping Instagram profile: ${username}`);
      
      // Using the Instagram Scraper actor
      // Actor ID: apify/instagram-scraper
      const run = await this.client.actor('apify/instagram-scraper').call({
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsType: 'details',
        resultsLimit: 1,
        searchType: 'user',
        searchLimit: 1,
      });

      // Wait for the run to finish
      await this.client.run(run.id).waitForFinish();

      // Get the results
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      
      if (items.length > 0) {
        const profile = items[0] as any;
        return {
          username: profile.username || username,
          followersCount: profile.followersCount || 0,
          followingCount: profile.followingCount || 0,
          postsCount: profile.postsCount || 0,
          verified: profile.verified || false,
          biography: profile.biography,
          profilePicUrl: profile.profilePicUrl,
        };
      }

      return null;
    } catch (error) {
      console.error('Error scraping Instagram:', error);
      return null;
    }
  }

  async scrapeYouTube(channelIdOrUsername: string): Promise<YouTubeChannel | null> {
    if (!this.client) {
      console.log('Apify client not initialized');
      return null;
    }

    try {
      console.log(`Scraping YouTube channel: ${channelIdOrUsername}`);
      
      // Determine if it's a channel ID or username
      const isChannelId = channelIdOrUsername.startsWith('UC');
      const url = isChannelId 
        ? `https://www.youtube.com/channel/${channelIdOrUsername}`
        : `https://www.youtube.com/@${channelIdOrUsername}`;

      // Using the YouTube Scraper actor
      // Actor ID: apify/youtube-scraper
      const run = await this.client.actor('apify/youtube-scraper').call({
        startUrls: [{ url }],
        maxResults: 1,
        scrapeType: 'channel',
      });

      // Wait for the run to finish
      await this.client.run(run.id).waitForFinish();

      // Get the results
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      
      if (items.length > 0) {
        const channel = items[0] as any;
        return {
          channelId: channel.channelId || channelIdOrUsername,
          title: channel.channelName || channel.title || '',
          subscriberCount: parseInt(channel.subscriberCount || '0'),
          videoCount: parseInt(channel.numberOfVideos || '0'),
          viewCount: parseInt(channel.viewCount || '0'),
          description: channel.channelDescription,
          thumbnailUrl: channel.channelAvatar || channel.avatar?.url,
        };
      }

      return null;
    } catch (error) {
      console.error('Error scraping YouTube:', error);
      return null;
    }
  }

  async scrapeTikTok(username: string): Promise<TikTokProfile | null> {
    if (!this.client) {
      console.log('Apify client not initialized');
      return null;
    }

    try {
      console.log(`Scraping TikTok profile: @${username}`);
      
      // Using Clockworks TikTok Scraper - maintained by Apify and free to use!
      const run = await this.client.actor('clockworks/tiktok-scraper').call({
        profiles: [`https://www.tiktok.com/@${username}`],
        resultsPerPage: 1,
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
        shouldDownloadSlideshowImages: false,
        shouldDownloadSubtitles: false,
      });

      // Wait for the run to finish
      await this.client.run(run.id).waitForFinish();

      // Get the results
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      
      if (items.length > 0) {
        const profile = items[0] as any;
        console.log('TikTok profile data received:', {
          username: profile.authorMeta?.name,
          followers: profile.authorMeta?.fans,
          verified: profile.authorMeta?.verified
        });
        
        // Clockworks scraper returns data in authorMeta format
        if (profile.authorMeta) {
          return {
            username: profile.authorMeta.name || username,
            followersCount: profile.authorMeta.fans || 0,
            followingCount: profile.authorMeta.following || 0,
            likesCount: profile.authorMeta.heart || 0,
            videoCount: profile.authorMeta.video || 0,
            verified: profile.authorMeta.verified || false,
            nickname: profile.authorMeta.nickName || profile.authorMeta.name,
            avatarUrl: profile.authorMeta.avatar,
          };
        }
      }

      console.log('No TikTok profile data found');
      return null;
    } catch (error) {
      console.error('Error scraping TikTok:', error);
      return null;
    }
  }

  async scrapeTwitter(username: string): Promise<TwitterProfile | null> {
    if (!this.client) {
      console.log('Apify client not initialized');
      return null;
    }

    // Twitter scraping is challenging due to API changes
    // The apify/twitter-scraper may require specific configuration
    // For now, log that Twitter requires additional setup
    console.log(`Twitter scraping for @${username} - Note: Twitter scraper may require paid actor or specific configuration`);
    console.log('Instagram, TikTok, and YouTube are fully functional');
    
    // You can try alternative scrapers like:
    // - apidojo/tweet-scraper ($0.40 per 1000 tweets)
    // - web.harvester/easy-twitter-search-scraper
    // - Or use the official Twitter API v2 (requires developer account)
    
    return null;
    
    /* Uncomment to try Twitter scraping with proper configuration:
    try {
      console.log(`Scraping Twitter profile: @${username}`);
      
      const run = await this.client.actor('apify/twitter-scraper').call({
        startUrls: [`https://twitter.com/${username}`],
        tweetsDesired: 1,
        proxyConfig: { useApifyProxy: true },
      });

      await this.client.run(run.id).waitForFinish();
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      
      if (items.length > 0) {
        // Parse response based on actual format
        return parseTwitterResponse(items[0]);
      }
      return null;
    } catch (error) {
      console.error('Error scraping Twitter:', error);
      return null;
    }
    */
  }

  // Helper method to scrape multiple platforms
  async scrapeAllPlatforms(handles: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
  }): Promise<{
    instagram?: InstagramProfile | null;
    youtube?: YouTubeChannel | null;
    tiktok?: TikTokProfile | null;
    twitter?: TwitterProfile | null;
  }> {
    const results: any = {};

    // Run scrapers in parallel for efficiency
    const promises = [];

    if (handles.instagram) {
      promises.push(
        this.scrapeInstagram(handles.instagram).then(data => {
          results.instagram = data;
        })
      );
    }

    if (handles.youtube) {
      promises.push(
        this.scrapeYouTube(handles.youtube).then(data => {
          results.youtube = data;
        })
      );
    }

    if (handles.tiktok) {
      promises.push(
        this.scrapeTikTok(handles.tiktok).then(data => {
          results.tiktok = data;
        })
      );
    }

    if (handles.twitter) {
      promises.push(
        this.scrapeTwitter(handles.twitter).then(data => {
          results.twitter = data;
        })
      );
    }

    await Promise.all(promises);
    return results;
  }
}

// Export singleton instance
export const apifyService = new ApifyService();