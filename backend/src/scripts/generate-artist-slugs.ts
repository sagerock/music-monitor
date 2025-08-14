import { prisma } from '../db/client';
import { generateSlug, ensureUniqueSlug } from '../utils/slug';

/**
 * Generate slugs for all existing artists that don't have one
 */
async function generateArtistSlugs() {
  console.log('🎵 Generating slugs for existing artists...');
  
  try {
    // Get all artists without slugs
    const artists = await prisma.artist.findMany({
      where: {
        slug: null
      },
      select: {
        id: true,
        name: true,
      }
    });

    console.log(`Found ${artists.length} artists without slugs`);

    let successCount = 0;
    let errorCount = 0;

    for (const artist of artists) {
      try {
        // Generate slug
        const baseSlug = generateSlug(artist.name);
        const slug = await ensureUniqueSlug(
          baseSlug,
          async (testSlug) => {
            const existing = await prisma.artist.findUnique({ where: { slug: testSlug } });
            return existing !== null && existing.id !== artist.id;
          },
          artist.id
        );

        // Update artist with slug
        await prisma.artist.update({
          where: { id: artist.id },
          data: { slug }
        });

        console.log(`✓ ${artist.name} → ${slug}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Failed to generate slug for ${artist.name} (${artist.id}):`, error);
        errorCount++;
      }
    }

    console.log(`\n✨ Slug generation complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);

    // Show some examples
    if (successCount > 0) {
      console.log('\n📋 Sample slugs:');
      const samples = await prisma.artist.findMany({
        where: {
          slug: { not: null }
        },
        select: {
          name: true,
          slug: true,
        },
        take: 10,
        orderBy: {
          updatedAt: 'desc'
        }
      });

      samples.forEach(s => {
        console.log(`   ${s.name} → /artist/${s.slug}`);
      });
    }

  } catch (error) {
    console.error('Failed to generate slugs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  generateArtistSlugs();
}

export { generateArtistSlugs };