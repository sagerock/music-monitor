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
      console.log(`Scraping TikTok profile: ${username}`);
      
      // Using the TikTok Scraper actor
      // Actor ID: clockworks/free-tiktok-scraper (free tier friendly)
      // Alternative: apify/tiktok-scraper (might require more credits)
      const run = await this.client.actor('clockworks/free-tiktok-scraper').call({
        profiles: [`https://www.tiktok.com/@${username}`],
        maxProfilesPerQuery: 1,
        resultsPerPage: 1,
      });

      // Wait for the run to finish
      await this.client.run(run.id).waitForFinish();

      // Get the results
      const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
      
      if (items.length > 0) {
        const profile = items[0] as any;
        console.log('TikTok scraper response:', JSON.stringify(profile, null, 2));
        
        // Different scrapers use different field names
        return {
          username: profile.uniqueId || profile.username || username,
          followersCount: profile.fans || profile.followersCount || profile.followers || 0,
          followingCount: profile.following || profile.followingCount || 0,
          likesCount: profile.heart || profile.likesCount || profile.likes || 0,
          videoCount: profile.video || profile.videoCount || profile.videos || 0,
          verified: profile.verified || false,
          nickname: profile.nickname || profile.name,
          avatarUrl: profile.avatarMedium || profile.avatarThumb || profile.avatar,
        };
      }

      console.log('No TikTok profile data found in scraper response');
      return null;
    } catch (error) {
      console.error('Error scraping TikTok:', error);
      // If the free scraper fails, try the official one
      try {
        console.log('Trying official TikTok scraper as fallback...');
        const run = await this.client.actor('apify/tiktok-scraper').call({
          profiles: [`https://www.tiktok.com/@${username}`],
          resultsPerPage: 1,
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
        });
        
        await this.client.run(run.id).waitForFinish();
        const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
        
        if (items.length > 0) {
          const profile = items[0] as any;
          return {
            username: profile.uniqueId || username,
            followersCount: profile.fans || 0,
            followingCount: profile.following || 0,
            likesCount: profile.heart || 0,
            videoCount: profile.video || 0,
            verified: profile.verified || false,
            nickname: profile.nickname,
            avatarUrl: profile.avatarMedium || profile.avatarThumb,
          };
        }
      } catch (fallbackError) {
        console.error('TikTok fallback scraper also failed:', fallbackError);
      }
      return null;
    }
  }

  // Helper method to scrape multiple platforms
  async scrapeAllPlatforms(handles: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  }): Promise<{
    instagram?: InstagramProfile | null;
    youtube?: YouTubeChannel | null;
    tiktok?: TikTokProfile | null;
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

    await Promise.all(promises);
    return results;
  }
}

// Export singleton instance
export const apifyService = new ApifyService();