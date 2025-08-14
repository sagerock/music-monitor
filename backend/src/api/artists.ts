import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/client';
import { spotifyClient } from '../integrations/spotify';
import { momentumService } from '../services/momentum';
import { subDays } from 'date-fns';
import { cache, getCacheKey } from '../utils/cache';
import { isValidSlug } from '../utils/slug';

const artistParamsSchema = z.object({
  id: z.string(),
});

const genresQuerySchema = z.object({
  limit: z.string().default('20').transform(Number),
});

export const artistRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = artistParamsSchema.parse(request.params);
      
      // Check if the ID is actually a slug
      const isSlug = isValidSlug(id);
      
      // Cache key for artist details
      const cacheKey = getCacheKey('artist-detail', { id });
      
      // Try to get from cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return reply.send({
          success: true,
          data: cachedData,
        });
      }
      
      // Try to find artist - handle missing slug field gracefully
      let artist;
      try {
        artist = await prisma.artist.findUnique({
          where: isSlug ? { slug: id } : { id },
          include: {
          tracks: {
            orderBy: { releaseDate: 'desc' },
            take: 10,
          },
          snapshots: {
            where: {
              snapshotDate: {
                gte: subDays(new Date(), 30),
              },
            },
            orderBy: { snapshotDate: 'asc' },
          },
        },
      });
      } catch (error) {
        // If slug field doesn't exist, fallback to ID only
        artist = await prisma.artist.findUnique({
          where: { id },
          include: {
            tracks: {
              orderBy: { releaseDate: 'desc' },
              take: 10,
            },
            snapshots: {
              where: {
                snapshotDate: {
                  gte: subDays(new Date(), 30),
                },
              },
              orderBy: { snapshotDate: 'asc' },
            },
          },
        });
      }

      if (!artist) {
        return reply.status(404).send({
          success: false,
          error: 'Artist not found',
        });
      }

      const momentum = await momentumService.getArtistMomentum(id, 14);
      
      const audioProfile = artist.tracks.length > 0
        ? {
            energy: artist.tracks.reduce((sum: number, t: any) => sum + (t.energy || 0), 0) / artist.tracks.length,
            danceability: artist.tracks.reduce((sum: number, t: any) => sum + (t.danceability || 0), 0) / artist.tracks.length,
            valence: artist.tracks.reduce((sum: number, t: any) => sum + (t.valence || 0), 0) / artist.tracks.length,
            tempo: artist.tracks.reduce((sum: number, t: any) => sum + (t.tempo || 0), 0) / artist.tracks.length,
            acousticness: artist.tracks.reduce((sum: number, t: any) => sum + (t.acousticness || 0), 0) / artist.tracks.length,
            instrumentalness: artist.tracks.reduce((sum: number, t: any) => sum + (t.instrumentalness || 0), 0) / artist.tracks.length,
          }
        : null;

      // Convert BigInt values to strings for JSON serialization
      const serializedArtist = {
        ...artist,
        followers: artist.followers ? artist.followers.toString() : null,
        snapshots: artist.snapshots.map((s: any) => ({
          ...s,
          id: s.id.toString(),
          followers: s.followers ? s.followers.toString() : null,
        })),
        tracks: artist.tracks.map((t: any) => ({
          ...t,
          duration: t.duration ? t.duration.toString() : null,
        })),
      };

      const responseData = {
        ...serializedArtist,
        momentum,
        audioProfile,
        lastSnapshots: serializedArtist.snapshots,
      };

      // Cache the result for 2 minutes (shorter than leaderboard since artist data changes more often)
      cache.set(cacheKey, responseData, 2 * 60 * 1000);

      return reply.send({
        success: true,
        data: responseData,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch artist details',
      });
    }
  });

  fastify.get('/genres/list', async (request, reply) => {
    try {
      const { limit } = genresQuerySchema.parse(request.query);
      
      const artists = await prisma.artist.findMany({
        select: { genres: true },
      });

      const genreCounts = new Map<string, number>();
      
      for (const artist of artists) {
        for (const genre of artist.genres) {
          genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
        }
      }

      const sortedGenres = Array.from(genreCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([genre, count]) => ({ genre, count }));

      return reply.send({
        success: true,
        data: sortedGenres,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch genres',
      });
    }
  });

  fastify.post('/sync/:id', async (request, reply) => {
    try {
      const { id } = artistParamsSchema.parse(request.params);
      
      const spotifyArtist = await spotifyClient.getArtist(id);
      
      const artist = await prisma.artist.upsert({
        where: { id },
        update: {
          name: spotifyArtist.name,
          genres: spotifyArtist.genres,
          popularity: spotifyArtist.popularity,
          followers: BigInt(spotifyArtist.followers.total),
          imageUrl: spotifyArtist.images[0]?.url,
          spotifyUrl: spotifyArtist.external_urls.spotify,
        },
        create: {
          id: spotifyArtist.id,
          name: spotifyArtist.name,
          genres: spotifyArtist.genres,
          popularity: spotifyArtist.popularity,
          followers: BigInt(spotifyArtist.followers.total),
          imageUrl: spotifyArtist.images[0]?.url,
          spotifyUrl: spotifyArtist.external_urls.spotify,
        },
      });

      const topTracks = await spotifyClient.getArtistTopTracks(id);
      // Audio features require user auth, skip for Client Credentials flow

      for (let i = 0; i < topTracks.length; i++) {
        const track = topTracks[i];
        const features: any = null;
        
        await prisma.track.upsert({
          where: { id: track.id },
          update: {
            name: track.name,
            albumId: track.album.id,
            albumName: track.album.name,
            releaseDate: new Date(track.album.release_date),
            tempo: features?.tempo,
            energy: features?.energy,
            danceability: features?.danceability,
            valence: features?.valence,
            loudness: features?.loudness,
            acousticness: features?.acousticness,
            instrumentalness: features?.instrumentalness,
            speechiness: features?.speechiness,
            duration: features?.duration_ms,
          },
          create: {
            id: track.id,
            artistId: id,
            name: track.name,
            albumId: track.album.id,
            albumName: track.album.name,
            releaseDate: new Date(track.album.release_date),
            tempo: features?.tempo,
            energy: features?.energy,
            danceability: features?.danceability,
            valence: features?.valence,
            loudness: features?.loudness,
            acousticness: features?.acousticness,
            instrumentalness: features?.instrumentalness,
            speechiness: features?.speechiness,
            duration: features?.duration_ms,
          },
        });
      }

      const playlistCount = await spotifyClient.checkArtistInEditorialPlaylists(id);

      await prisma.snapshot.create({
        data: {
          artistId: id,
          snapshotDate: new Date(),
          popularity: spotifyArtist.popularity,
          followers: BigInt(spotifyArtist.followers.total),
          playlistCount,
        },
      });

      return reply.send({
        success: true,
        data: {
          ...artist,
          followers: artist.followers ? artist.followers.toString() : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to sync artist',
      });
    }
  });
};