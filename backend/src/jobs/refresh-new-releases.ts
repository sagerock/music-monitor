import { prisma } from '../db/client';
import { spotifyClient } from '../integrations/spotify';
import { generateSlug, ensureUniqueSlug } from '../utils/slug';

export async function refreshNewReleases() {
  const startTime = new Date();
  let processedCount = 0;
  let errorCount = 0;

  try {
    await prisma.jobLog.create({
      data: {
        jobName: 'refresh-new-releases',
        status: 'running',
        startedAt: startTime,
      },
    });

    const newReleases = await spotifyClient.getNewReleases(undefined, 50);
    const artistIds = new Set<string>();

    for (const track of newReleases) {
      if (track.artists && track.artists.length > 0) {
        for (const artist of track.artists) {
          artistIds.add(artist.id);
        }
      }
    }

    const artistIdArray = Array.from(artistIds);
    const spotifyArtists = await spotifyClient.getArtists(artistIdArray);

    for (const spotifyArtist of spotifyArtists) {
      try {
        // Try to generate slug, but handle if field doesn't exist
        let updateData: any = {
          name: spotifyArtist.name,
          genres: spotifyArtist.genres,
          popularity: spotifyArtist.popularity,
          followers: BigInt(spotifyArtist.followers.total),
          imageUrl: spotifyArtist.images[0]?.url,
          spotifyUrl: spotifyArtist.external_urls.spotify,
          updatedAt: new Date(),
        };

        let createData: any = {
          id: spotifyArtist.id,
          name: spotifyArtist.name,
          genres: spotifyArtist.genres,
          popularity: spotifyArtist.popularity,
          followers: BigInt(spotifyArtist.followers.total),
          imageUrl: spotifyArtist.images[0]?.url,
          spotifyUrl: spotifyArtist.external_urls.spotify,
        };

        // Try to add slug if possible
        try {
          const baseSlug = generateSlug(spotifyArtist.name);
          const slug = await ensureUniqueSlug(
            baseSlug,
            async (testSlug) => {
              try {
                const existing = await prisma.artist.findUnique({ where: { slug: testSlug } });
                return existing !== null && existing.id !== spotifyArtist.id;
              } catch {
                return false; // If slug field doesn't exist, assume no conflict
              }
            },
            spotifyArtist.id
          );
          updateData.slug = slug;
          createData.slug = slug;
        } catch (error) {
          // Slug field might not exist yet, continue without it
          console.log('Slug generation skipped - field may not exist');
        }

        await prisma.artist.upsert({
          where: { id: spotifyArtist.id },
          update: updateData,
          create: createData,
        });

        await prisma.snapshot.create({
          data: {
            artistId: spotifyArtist.id,
            snapshotDate: new Date(),
            popularity: spotifyArtist.popularity,
            followers: BigInt(spotifyArtist.followers.total),
          },
        });

        processedCount++;
      } catch (error) {
        console.error(`Error processing artist ${spotifyArtist.id}:`, error);
        errorCount++;
      }
    }

    const trackIds = newReleases.map(t => t.id).filter(Boolean);
    if (trackIds.length > 0) {
      // Audio features require user auth, skip for Client Credentials flow
      
      for (const track of newReleases) {
        if (!track.id || !track.artists[0]) continue;
        
        const features: any = null;
        
        try {
          await prisma.track.upsert({
            where: { id: track.id },
            update: {
              name: track.name,
              albumId: track.album?.id,
              albumName: track.album?.name,
              releaseDate: track.album?.release_date ? new Date(track.album.release_date) : null,
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
              artistId: track.artists[0].id,
              name: track.name,
              albumId: track.album?.id,
              albumName: track.album?.name,
              releaseDate: track.album?.release_date ? new Date(track.album.release_date) : null,
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
        } catch (error) {
          console.error(`Error processing track ${track.id}:`, error);
          errorCount++;
        }
      }
    }

    await prisma.jobLog.create({
      data: {
        jobName: 'refresh-new-releases',
        status: 'completed',
        message: `Processed ${processedCount} artists, ${errorCount} errors`,
        startedAt: startTime,
        completedAt: new Date(),
      },
    });

    return {
      processedCount,
      errorCount,
      duration: Date.now() - startTime.getTime(),
    };
  } catch (error) {
    await prisma.jobLog.create({
      data: {
        jobName: 'refresh-new-releases',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        startedAt: startTime,
        completedAt: new Date(),
        errorDetails: error instanceof Error ? { message: error.message, stack: error.stack } : {},
      },
    });

    throw error;
  }
}