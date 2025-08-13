import { prisma } from '../db/client';
import { subDays } from 'date-fns';

interface ArtistSnapshot {
  artistId: string;
  popularity: number | null;
  followers: bigint | null;
  tiktokMentions: number | null;
  playlistCount: number | null;
}

interface MomentumData {
  artistId: string;
  name: string;
  genres: string[];
  currentPopularity: number;
  currentFollowers: number;
  deltaPopularity: number;
  deltaFollowersPct: number;
  deltaTiktokPct: number;
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
      },
    });

    const momentumData: MomentumData[] = [];
    const allDeltaPopularity: number[] = [];
    const allDeltaFollowersPct: number[] = [];
    const allDeltaTiktokPct: number[] = [];

    for (const artist of artists) {
      if (artist.snapshots.length < 2) continue;

      const firstSnapshot = artist.snapshots[0];
      const lastSnapshot = artist.snapshots[artist.snapshots.length - 1];

      const deltaPopularity = (lastSnapshot.popularity || 0) - (firstSnapshot.popularity || 0);
      const deltaFollowersPct = firstSnapshot.followers && firstSnapshot.followers > 0n
        ? Number((lastSnapshot.followers || 0n) - firstSnapshot.followers) / Number(firstSnapshot.followers)
        : 0;
      
      const deltaTiktokPct = firstSnapshot.tiktokMentions && firstSnapshot.tiktokMentions > 0
        ? ((lastSnapshot.tiktokMentions || 0) - firstSnapshot.tiktokMentions) / firstSnapshot.tiktokMentions
        : 0;

      allDeltaPopularity.push(deltaPopularity);
      allDeltaFollowersPct.push(deltaFollowersPct);
      allDeltaTiktokPct.push(deltaTiktokPct);

      const sparkline = artist.snapshots.map(s => s.popularity || 0);

      momentumData.push({
        artistId: artist.id,
        name: artist.name,
        genres: artist.genres,
        currentPopularity: lastSnapshot.popularity || 0,
        currentFollowers: Number(lastSnapshot.followers || 0n),
        deltaPopularity,
        deltaFollowersPct,
        deltaTiktokPct,
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
      const tiktokGrowth = data.deltaTiktokPct * 2; // Scale TikTok percentage
      
      data.momentumScore = popGrowth + followerGrowth + tiktokGrowth;
    } else {
      // Multiple artists - use z-score normalization
      for (const data of momentumData) {
        const popZScore = this.calculateZScore(data.deltaPopularity, allDeltaPopularity);
        const followersZScore = this.calculateZScore(data.deltaFollowersPct, allDeltaFollowersPct);
        const tiktokZScore = allDeltaTiktokPct.length > 0
          ? this.calculateZScore(data.deltaTiktokPct, allDeltaTiktokPct)
          : 0;

        const spotifyGrowth = popZScore + 0.5 * followersZScore;
        const tiktokGrowth = tiktokZScore;
        
        data.momentumScore = 0.8 * spotifyGrowth + 0.2 * tiktokGrowth;
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
    
    const deltaTiktokPct = firstSnapshot.tiktokMentions && firstSnapshot.tiktokMentions > 0
      ? ((lastSnapshot.tiktokMentions || 0) - firstSnapshot.tiktokMentions) / firstSnapshot.tiktokMentions
      : 0;

    const sparkline = artist.snapshots.map(s => s.popularity || 0);

    const genreArtists = await this.calculateMomentum(artist.genres, days, 100);
    const genreDeltas = {
      popularity: genreArtists.map(a => a.deltaPopularity),
      followers: genreArtists.map(a => a.deltaFollowersPct),
      tiktok: genreArtists.map(a => a.deltaTiktokPct),
    };

    const popZScore = this.calculateZScore(deltaPopularity, genreDeltas.popularity);
    const followersZScore = this.calculateZScore(deltaFollowersPct, genreDeltas.followers);
    const tiktokZScore = genreDeltas.tiktok.length > 0
      ? this.calculateZScore(deltaTiktokPct, genreDeltas.tiktok)
      : 0;

    const spotifyGrowth = popZScore + 0.5 * followersZScore;
    const tiktokGrowth = tiktokZScore;
    const momentumScore = 0.8 * spotifyGrowth + 0.2 * tiktokGrowth;

    return {
      artistId: artist.id,
      name: artist.name,
      genres: artist.genres,
      currentPopularity: lastSnapshot.popularity || 0,
      currentFollowers: Number(lastSnapshot.followers || 0n),
      deltaPopularity,
      deltaFollowersPct,
      deltaTiktokPct,
      momentumScore,
      sparkline,
    };
  }
}

export const momentumService = new MomentumService();