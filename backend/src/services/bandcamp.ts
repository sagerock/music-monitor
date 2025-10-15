import bcfetch from 'bandcamp-fetch';
import { prisma } from '../db/client';
import PQueue from 'p-queue';

interface BandcampArtistStats {
  name: string;
  handle: string;
  url: string;
  imageUrl?: string;
  location?: string;
  description?: string;
  releaseCount?: number;
  labelName?: string;
}

interface BandcampAlbumInfo {
  id: string;
  name: string;
  artist: string;
  url: string;
  imageUrl?: string;
  releaseDate?: Date;
  tags?: string[];
  supporterCount?: number;
}

export class BandcampService {
  private queue: PQueue;

  constructor() {
    // Rate limiting: Be respectful with scraping
    // 2-3 seconds between requests to avoid overwhelming Bandcamp
    this.queue = new PQueue({
      concurrency: 1,
      interval: 2500, // 2.5 seconds between requests
      intervalCap: 1,
    });
  }

  /**
   * Extract Bandcamp handle from URL
   * Supports: https://artistname.bandcamp.com or https://bandcamp.com/artistname
   */
  extractHandle(url: string): string | null {
    try {
      const urlObj = new URL(url);

      // Subdomain format: artistname.bandcamp.com
      if (urlObj.hostname.endsWith('.bandcamp.com') && urlObj.hostname !== 'bandcamp.com') {
        return urlObj.hostname.split('.')[0];
      }

      // Path format (less common): bandcamp.com/artistname
      if (urlObj.hostname === 'bandcamp.com') {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          return pathParts[0];
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Construct Bandcamp URL from handle
   */
  constructUrl(handle: string): string {
    return `https://${handle}.bandcamp.com`;
  }

  /**
   * Fetch artist/label information from Bandcamp
   */
  async fetchArtistInfo(urlOrHandle: string): Promise<BandcampArtistStats | null> {
    return (await this.queue.add(async () => {
      try {
        let url: string;

        // Check if it's a URL or just a handle
        if (urlOrHandle.startsWith('http')) {
          url = urlOrHandle;
        } else {
          url = this.constructUrl(urlOrHandle);
        }

        console.log(`Fetching Bandcamp artist info: ${url}`);

        // Fetch band info using bandcamp-fetch
        const bandInfo = await bcfetch.band.getInfo({ bandUrl: url });

        if (!bandInfo) {
          console.warn(`No info found for ${url}`);
          return null;
        }

        const handle = this.extractHandle(url);
        if (!handle) {
          console.warn(`Could not extract handle from ${url}`);
          return null;
        }

        return {
          name: bandInfo.name || handle,
          handle,
          url,
          imageUrl: bandInfo.imageUrl || undefined,
          location: bandInfo.location || undefined,
          description: bandInfo.description || undefined,
          labelName: (bandInfo as any).label?.name || undefined,
        };
      } catch (error: any) {
        console.error(`Error fetching Bandcamp info for ${urlOrHandle}:`, error.message);
        return null;
      }
    })) as BandcampArtistStats | null;
  }

  /**
   * Fetch discography for an artist/label
   */
  async fetchDiscography(urlOrHandle: string): Promise<BandcampAlbumInfo[]> {
    return await this.queue.add(async () => {
      try {
        let url: string;

        if (urlOrHandle.startsWith('http')) {
          url = urlOrHandle;
        } else {
          url = this.constructUrl(urlOrHandle);
        }

        console.log(`Fetching Bandcamp discography: ${url}`);

        const discography = await bcfetch.band.getDiscography({ bandUrl: url });

        if (!discography || !(discography as any).items) {
          return [];
        }

        return (discography as any).items.map((item: any) => ({
          id: item.url || `${url}/${item.name}`,
          name: item.name || 'Untitled',
          artist: item.artist?.name || 'Unknown',
          url: item.url || url,
          imageUrl: item.imageUrl || undefined,
          releaseDate: item.releaseDate ? new Date(item.releaseDate) : undefined,
          tags: item.tags || [],
        }));
      } catch (error: any) {
        console.error(`Error fetching Bandcamp discography for ${urlOrHandle}:`, error.message);
        return [];
      }
    });
  }

  /**
   * Fetch album details including supporter count
   */
  async fetchAlbumDetails(albumUrl: string): Promise<{ supporterCount?: number; wishlistCount?: number } | null> {
    return (await this.queue.add(async () => {
      try {
        console.log(`Fetching Bandcamp album details: ${albumUrl}`);

        const albumInfo = await bcfetch.album.getInfo({ albumUrl });

        if (!albumInfo) {
          return null;
        }

        // Try to extract supporter count from album info
        // Note: bandcamp-fetch may not expose this directly, but we'll attempt to get what we can
        return {
          supporterCount: (albumInfo as any).numSupporters || undefined,
          wishlistCount: (albumInfo as any).wishlistCount || undefined,
        };
      } catch (error: any) {
        console.error(`Error fetching Bandcamp album details for ${albumUrl}:`, error.message);
        return null;
      }
    })) as { supporterCount?: number; wishlistCount?: number } | null;
  }

  /**
   * Update Bandcamp stats for all artists with Bandcamp links
   */
  async updateAllBandcampStats(): Promise<void> {
    console.log('Starting Bandcamp stats update...');

    try {
      // Get all artists with Bandcamp social links
      const bandcampLinks = await prisma.artistSocial.findMany({
        where: { platform: 'bandcamp' },
        include: { artist: true },
      });

      console.log(`Found ${bandcampLinks.length} Bandcamp links to update`);

      let successCount = 0;
      let errorCount = 0;

      for (const link of bandcampLinks) {
        try {
          // Fetch artist info
          const artistInfo = await this.fetchArtistInfo(link.url);

          if (!artistInfo) {
            console.warn(`No info found for ${link.url}`);
            errorCount++;
            continue;
          }

          // Fetch discography to count releases
          const discography = await this.fetchDiscography(link.url);
          const albumCount = discography.length;

          // Calculate total supporter count across all releases (if available)
          let totalSupporters = 0;
          for (const album of discography.slice(0, 5)) { // Only check first 5 albums to avoid rate limiting
            const albumDetails = await this.fetchAlbumDetails(album.url);
            if (albumDetails?.supporterCount) {
              totalSupporters += albumDetails.supporterCount;
            }
          }

          // Create snapshot
          await prisma.socialSnapshot.create({
            data: {
              artistSocialId: link.id,
              snapshotDate: new Date(),
              followerCount: BigInt(totalSupporters || 0), // Store as supporter count
              postCount: albumCount, // Store album count as post count
              metrics: {
                albumCount,
                supporterCount: totalSupporters,
                labelName: artistInfo.labelName || null,
                location: artistInfo.location || null,
              },
            },
          });

          // Update the social link with latest data
          await prisma.artistSocial.update({
            where: { id: link.id },
            data: {
              followerCount: BigInt(totalSupporters || 0),
              lastFetched: new Date(),
            },
          });

          console.log(`✓ Updated Bandcamp stats for ${artistInfo.name}`);
          successCount++;
        } catch (error: any) {
          console.error(`Error updating Bandcamp stats for artist ${link.artistId}:`, error.message);
          errorCount++;
        }
      }

      console.log(`Bandcamp stats update completed: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      console.error('Error in Bandcamp stats update:', error);
      throw error;
    }
  }

  /**
   * Search Bandcamp by tag/genre
   */
  async searchByTag(tag: string, limit: number = 20): Promise<BandcampAlbumInfo[]> {
    return await this.queue.add(async () => {
      try {
        console.log(`Searching Bandcamp by tag: ${tag}`);

        const results = await bcfetch.discovery.discover({
          params: { tag },
        } as any);

        if (!results || !(results as any).items) {
          return [];
        }

        return (results as any).items.slice(0, limit).map((item: any) => ({
          id: item.url || item.name,
          name: item.name || 'Untitled',
          artist: item.artist?.name || 'Unknown',
          url: item.url || '',
          imageUrl: item.imageUrl || undefined,
          tags: item.tags || [tag],
        }));
      } catch (error: any) {
        console.error(`Error searching Bandcamp by tag ${tag}:`, error.message);
        return [];
      }
    });
  }

  /**
   * Get trending/bestselling artists in a genre
   */
  async getBestsellers(genre?: string, limit: number = 20): Promise<BandcampAlbumInfo[]> {
    return await this.queue.add(async () => {
      try {
        const params: any = { limit };
        if (genre) {
          params.tag = genre;
        }

        console.log(`Fetching Bandcamp bestsellers${genre ? ` for ${genre}` : ''}`);

        const results = await bcfetch.discovery.discover({
          params: {
            ...params,
            sort: 'bestselling',
          },
        } as any);

        if (!results || !(results as any).items) {
          return [];
        }

        return (results as any).items.slice(0, limit).map((item: any) => ({
          id: item.url || item.name,
          name: item.name || 'Untitled',
          artist: item.artist?.name || 'Unknown',
          url: item.url || '',
          imageUrl: item.imageUrl || undefined,
          tags: item.tags || [],
        }));
      } catch (error: any) {
        console.error(`Error fetching Bandcamp bestsellers:`, error.message);
        return [];
      }
    });
  }
}

export const bandcampService = new BandcampService();
