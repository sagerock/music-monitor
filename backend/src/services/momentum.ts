import { prisma } from '../db/client';
import { subDays } from 'date-fns';

interface MomentumData {
  artistId: string;
  name: string;
  slug: string | null;
  genres: string[];
  currentPopularity: number;
  currentFollowers: number;
  deltaPopularity: number;
  deltaFollowersPct: number;
  deltaTiktokPct: number;
  deltaInstagramPct: number;
  deltaYoutubePct: number;
  momentumScore: number;
  sparkline: number[];
}

export class MomentumService {
  private calculateZScore(value: number, values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  }

  async calculateMomentum(
    genres: string[],
    days: number = 14,
    limit: number = 50
  ): Promise<MomentumData[]> {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const artistsQuery = genres.length > 0
      ? { genres: { hasSome: genres } }
      : {};

    const artists = await prisma.artist.findMany({
      where: artistsQuery,
      include: {
        snapshots: {
          where: {
            snapshotDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { snapshotDate: 'asc' },
        },
        socialLinks: {
          include: {
            snapshots: {
              where: {
                snapshotDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              orderBy: { snapshotDate: 'asc' },
            },
          },
        },
      },
    });

    const momentumData: MomentumData[] = [];
    const allDeltaPopularity: number[] = [];
    const allDeltaFollowersPct: number[] = [];
    const allDeltaTiktokPct: number[] = [];
    const allDeltaInstagramPct: number[] = [];
    const allDeltaYoutubePct: number[] = [];

    for (const artist of artists) {
      if (artist.snapshots.length < 2) continue;

      const firstSnapshot = artist.snapshots[0];
      const lastSnapshot = artist.snapshots[artist.snapshots.length - 1];

      const deltaPopularity = (lastSnapshot.popularity || 0) - (firstSnapshot.popularity || 0);
      const deltaFollowersPct = firstSnapshot.followers && firstSnapshot.followers > 0n
        ? Number((lastSnapshot.followers || 0n) - firstSnapshot.followers) / Number(firstSnapshot.followers)
        : 0;
      
      // Calculate social media growth percentages
      let deltaTiktokPct = 0;
      let deltaInstagramPct = 0;
      let deltaYoutubePct = 0;

      // Get social platform data
      for (const social of artist.socialLinks || []) {
        if (social.snapshots.length < 2) continue;
        
        const firstSocial = social.snapshots[0];
        const lastSocial = social.snapshots[social.snapshots.length - 1];
        
        const growthPct = firstSocial.followerCount && firstSocial.followerCount > 0n
          ? Number((lastSocial.followerCount || 0n) - firstSocial.followerCount) / Number(firstSocial.followerCount)
          : 0;

        switch (social.platform) {
          case 'tiktok':
            deltaTiktokPct = growthPct;
            break;
          case 'instagram':
            deltaInstagramPct = growthPct;
            break;
          case 'youtube':
            deltaYoutubePct = growthPct;
            break;
        }
      }

      allDeltaPopularity.push(deltaPopularity);
      allDeltaFollowersPct.push(deltaFollowersPct);
      allDeltaTiktokPct.push(deltaTiktokPct);
      allDeltaInstagramPct.push(deltaInstagramPct);
      allDeltaYoutubePct.push(deltaYoutubePct);

      const sparkline = artist.snapshots.map((s: any) => s.popularity || 0);

      momentumData.push({
        artistId: artist.id,
        name: artist.name,
        slug: artist.slug,
        genres: artist.genres,
        currentPopularity: lastSnapshot.popularity || 0,
        currentFollowers: Number(lastSnapshot.followers || 0n),
        deltaPopularity,
        deltaFollowersPct,
        deltaTiktokPct,
        deltaInstagramPct,
        deltaYoutubePct,
        momentumScore: 0,
        sparkline,
      });
    }

    // If there's only one artist, calculate momentum based on raw growth
    if (momentumData.length === 1) {
      const data = momentumData[0];
      // Use raw percentage growth as momentum for single artists
      const popGrowth = data.deltaPopularity / 10; // Scale popularity change (0-100 range)
      const followerGrowth = data.deltaFollowersPct * 5; // Scale follower percentage
      const tiktokGrowth = data.deltaTiktokPct * 3; // Scale TikTok percentage
      const instagramGrowth = data.deltaInstagramPct * 2; // Scale Instagram percentage
      const youtubeGrowth = data.deltaYoutubePct * 2; // Scale YouTube percentage
      
      // Weighted combination: Spotify (40%), Social Media (60%)
      const spotifyScore = popGrowth + followerGrowth;
      const socialScore = tiktokGrowth + instagramGrowth + youtubeGrowth;
      data.momentumScore = 0.4 * spotifyScore + 0.6 * socialScore;
    } else {
      // Multiple artists - use z-score normalization
      for (const data of momentumData) {
        const popZScore = this.calculateZScore(data.deltaPopularity, allDeltaPopularity);
        const followersZScore = this.calculateZScore(data.deltaFollowersPct, allDeltaFollowersPct);
        const tiktokZScore = allDeltaTiktokPct.length > 0
          ? this.calculateZScore(data.deltaTiktokPct, allDeltaTiktokPct)
          : 0;
        const instagramZScore = allDeltaInstagramPct.length > 0
          ? this.calculateZScore(data.deltaInstagramPct, allDeltaInstagramPct)
          : 0;
        const youtubeZScore = allDeltaYoutubePct.length > 0
          ? this.calculateZScore(data.deltaYoutubePct, allDeltaYoutubePct)
          : 0;

        // Weighted combination: Spotify growth (40%), Social growth (60%)
        const spotifyGrowth = popZScore + 0.5 * followersZScore;
        const socialGrowth = 0.4 * tiktokZScore + 0.3 * instagramZScore + 0.3 * youtubeZScore;
        
        data.momentumScore = 0.4 * spotifyGrowth + 0.6 * socialGrowth;
      }
    }

    momentumData.sort((a, b) => b.momentumScore - a.momentumScore);

    return momentumData.slice(0, limit);
  }

  async getArtistMomentum(artistId: string, days: number = 14): Promise<MomentumData | null> {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      include: {
        snapshots: {
          where: {
            snapshotDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { snapshotDate: 'asc' },
        },
        socialLinks: {
          include: {
            snapshots: {
              where: {
                snapshotDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              orderBy: { snapshotDate: 'asc' },
            },
          },
        },
      },
    });

    if (!artist || artist.snapshots.length < 2) {
      return null;
    }

    const firstSnapshot = artist.snapshots[0];
    const lastSnapshot = artist.snapshots[artist.snapshots.length - 1];

    const deltaPopularity = (lastSnapshot.popularity || 0) - (firstSnapshot.popularity || 0);
    const deltaFollowersPct = firstSnapshot.followers && firstSnapshot.followers > 0n
      ? Number((lastSnapshot.followers || 0n) - firstSnapshot.followers) / Number(firstSnapshot.followers)
      : 0;
    
    // Calculate social media growth percentages
    let deltaTiktokPct = 0;
    let deltaInstagramPct = 0;
    let deltaYoutubePct = 0;

    // Get social platform data
    for (const social of artist.socialLinks || []) {
      if (social.snapshots.length < 2) continue;
      
      const firstSocial = social.snapshots[0];
      const lastSocial = social.snapshots[social.snapshots.length - 1];
      
      const growthPct = firstSocial.followerCount && firstSocial.followerCount > 0n
        ? Number((lastSocial.followerCount || 0n) - firstSocial.followerCount) / Number(firstSocial.followerCount)
        : 0;

      switch (social.platform) {
        case 'tiktok':
          deltaTiktokPct = growthPct;
          break;
        case 'instagram':
          deltaInstagramPct = growthPct;
          break;
        case 'youtube':
          deltaYoutubePct = growthPct;
          break;
      }
    }

    const sparkline = artist.snapshots.map((s: any) => s.popularity || 0);

    const genreArtists = await this.calculateMomentum(artist.genres, days, 100);
    const genreDeltas = {
      popularity: genreArtists.map(a => a.deltaPopularity),
      followers: genreArtists.map(a => a.deltaFollowersPct),
      tiktok: genreArtists.map(a => a.deltaTiktokPct),
      instagram: genreArtists.map(a => a.deltaInstagramPct),
      youtube: genreArtists.map(a => a.deltaYoutubePct),
    };

    const popZScore = this.calculateZScore(deltaPopularity, genreDeltas.popularity);
    const followersZScore = this.calculateZScore(deltaFollowersPct, genreDeltas.followers);
    const tiktokZScore = genreDeltas.tiktok.length > 0
      ? this.calculateZScore(deltaTiktokPct, genreDeltas.tiktok)
      : 0;
    const instagramZScore = genreDeltas.instagram.length > 0
      ? this.calculateZScore(deltaInstagramPct, genreDeltas.instagram)
      : 0;
    const youtubeZScore = genreDeltas.youtube.length > 0
      ? this.calculateZScore(deltaYoutubePct, genreDeltas.youtube)
      : 0;

    // Weighted combination: Spotify growth (40%), Social growth (60%)
    const spotifyGrowth = popZScore + 0.5 * followersZScore;
    const socialGrowth = 0.4 * tiktokZScore + 0.3 * instagramZScore + 0.3 * youtubeZScore;
    const momentumScore = 0.4 * spotifyGrowth + 0.6 * socialGrowth;

    return {
      artistId: artist.id,
      name: artist.name,
      slug: artist.slug,
      genres: artist.genres,
      currentPopularity: lastSnapshot.popularity || 0,
      currentFollowers: Number(lastSnapshot.followers || 0n),
      deltaPopularity,
      deltaFollowersPct,
      deltaTiktokPct,
      deltaInstagramPct,
      deltaYoutubePct,
      momentumScore,
      sparkline,
    };
  }
}

export const momentumService = new MomentumService();