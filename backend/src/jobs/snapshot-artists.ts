import { prisma } from '../db/client';
import { spotifyClient } from '../integrations/spotify';
import { subDays } from 'date-fns';

export async function snapshotArtists() {
  const startTime = new Date();
  let processedCount = 0;
  let errorCount = 0;

  try {
    await prisma.jobLog.create({
      data: {
        jobName: 'snapshot-artists',
        status: 'running',
        startedAt: startTime,
      },
    });

    const artists = await prisma.artist.findMany({
      where: {
        OR: [
          { updatedAt: { lt: subDays(new Date(), 1) } },
          {
            snapshots: {
              none: {
                snapshotDate: {
                  gte: subDays(new Date(), 1),
                },
              },
            },
          },
        ],
      },
      take: 100,
    });

    const artistIds = artists.map(a => a.id);
    
    if (artistIds.length > 0) {
      const spotifyArtists = await spotifyClient.getArtists(artistIds);
      
      for (const spotifyArtist of spotifyArtists) {
        try {
          await prisma.artist.update({
            where: { id: spotifyArtist.id },
            data: {
              name: spotifyArtist.name,
              genres: spotifyArtist.genres,
              popularity: spotifyArtist.popularity,
              followers: BigInt(spotifyArtist.followers.total),
              imageUrl: spotifyArtist.images[0]?.url,
              spotifyUrl: spotifyArtist.external_urls.spotify,
              updatedAt: new Date(),
            },
          });

          const existingSnapshot = await prisma.snapshot.findFirst({
            where: {
              artistId: spotifyArtist.id,
              snapshotDate: {
                gte: subDays(new Date(), 1),
                lte: new Date(),
              },
            },
          });

          if (!existingSnapshot) {
            const playlistCount = await spotifyClient.checkArtistInEditorialPlaylists(
              spotifyArtist.id
            );

            await prisma.snapshot.create({
              data: {
                artistId: spotifyArtist.id,
                snapshotDate: new Date(),
                popularity: spotifyArtist.popularity,
                followers: BigInt(spotifyArtist.followers.total),
                playlistCount,
              },
            });
          }

          processedCount++;
        } catch (error) {
          console.error(`Error processing artist ${spotifyArtist.id}:`, error);
          errorCount++;
        }
      }
    }

    await prisma.$executeRaw`
      DELETE FROM snapshots 
      WHERE snapshot_date < ${subDays(new Date(), 90)}
    `;

    await prisma.jobLog.create({
      data: {
        jobName: 'snapshot-artists',
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
        jobName: 'snapshot-artists',
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