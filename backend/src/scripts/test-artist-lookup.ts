import { prisma } from '../db/client';

async function testArtistLookup() {
  try {
    // Get a sample artist
    const artists = await prisma.artist.findMany({
      take: 1,
    });
    
    if (artists.length === 0) {
      console.log('No artists found in database');
      return;
    }
    
    const sampleArtist = artists[0];
    console.log('Sample artist:', {
      id: sampleArtist.id,
      name: sampleArtist.name,
      slug: (sampleArtist as any).slug,
    });
    
    // Try to find by ID
    const byId = await prisma.artist.findUnique({
      where: { id: sampleArtist.id },
    });
    
    console.log('Found by ID:', byId ? 'Yes' : 'No');
    
    // Check if slug field exists
    if ((sampleArtist as any).slug) {
      try {
        const bySlug = await prisma.artist.findUnique({
          where: { slug: (sampleArtist as any).slug },
        });
        console.log('Found by slug:', bySlug ? 'Yes' : 'No');
      } catch (error) {
        console.log('Slug field error:', error);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testArtistLookup();