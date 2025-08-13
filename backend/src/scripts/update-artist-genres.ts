import { prisma } from '../db/client';
import { spotifyClient } from '../integrations/spotify';

async function updateArtistGenres() {
  // Find artists without genres
  const artistsWithoutGenres = await prisma.artist.findMany({
    where: {
      genres: {
        isEmpty: true
      }
    }
  });

  console.log(`Found ${artistsWithoutGenres.length} artists without genres`);

  for (const artist of artistsWithoutGenres) {
    try {
      console.log(`Fetching genres for ${artist.name}...`);
      
      // Get artist details from Spotify
      const spotifyArtist = await spotifyClient.getArtist(artist.id);
      
      if (spotifyArtist && spotifyArtist.genres && spotifyArtist.genres.length > 0) {
        await prisma.artist.update({
          where: { id: artist.id },
          data: {
            genres: spotifyArtist.genres
          }
        });
        console.log(`✓ Updated ${artist.name} with genres: ${spotifyArtist.genres.join(', ')}`);
      } else {
        console.log(`✗ No genres found for ${artist.name}`);
      }
    } catch (error) {
      console.error(`Error updating ${artist.name}:`, error);
    }
  }

  await prisma.$disconnect();
}

updateArtistGenres();