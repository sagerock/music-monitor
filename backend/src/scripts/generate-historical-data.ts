import { prisma } from '../db/client';

async function generateHistoricalData() {
  console.log('Generating historical data for all artists...');
  
  try {
    // Get all artists
    const artists = await prisma.artist.findMany();
    console.log(`Found ${artists.length} artists`);
    
    for (const artist of artists) {
      console.log(`Generating data for ${artist.name}...`);
      
      // Check if artist already has historical data
      const existingSnapshots = await prisma.snapshot.findMany({
        where: { artistId: artist.id },
        orderBy: { snapshotDate: 'asc' },
      });
      
      if (existingSnapshots.length > 1) {
        console.log(`  - Already has ${existingSnapshots.length} snapshots, skipping`);
        continue;
      }
      
      // Generate snapshots for the past 30 days
      const today = new Date();
      const snapshots = [];
      
      for (let daysAgo = 30; daysAgo >= 1; daysAgo--) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        
        // Simulate gradual growth with some randomness
        const growthFactor = 1 - (daysAgo * 0.003); // ~10% growth over 30 days
        const randomVariation = 0.95 + Math.random() * 0.1; // ±5% random variation
        
        const popularity = artist.popularity 
          ? Math.round(artist.popularity * growthFactor * randomVariation)
          : null;
          
        const followers = artist.followers 
          ? BigInt(Math.round(Number(artist.followers) * growthFactor * randomVariation))
          : null;
        
        // Add some random TikTok mentions (0-1000)
        const tiktokMentions = Math.floor(Math.random() * 1000 * growthFactor);
        
        // Random playlist count (0-20)
        const playlistCount = Math.floor(Math.random() * 20 * growthFactor);
        
        snapshots.push({
          artistId: artist.id,
          snapshotDate: date,
          popularity: Math.min(100, Math.max(0, popularity || 0)),
          followers,
          tiktokMentions,
          playlistCount,
        });
      }
      
      // Create all snapshots
      await prisma.snapshot.createMany({
        data: snapshots,
        skipDuplicates: true,
      });
      
      console.log(`  - Created ${snapshots.length} historical snapshots`);
    }
    
    // Now let's check the momentum calculation
    console.log('\nChecking momentum scores...');
    
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 14); // 14 days ago
    
    for (const artist of artists) {
      const snapshots = await prisma.snapshot.findMany({
        where: {
          artistId: artist.id,
          snapshotDate: { gte: recentDate },
        },
        orderBy: { snapshotDate: 'desc' },
      });
      
      if (snapshots.length >= 2) {
        const [current, past] = snapshots;
        const popChange = (current.popularity || 0) - (past.popularity || 0);
        const followerChange = past.followers && past.followers > 0n
          ? (Number(current.followers || 0n) - Number(past.followers)) / Number(past.followers) * 100
          : 0;
        
        console.log(`${artist.name}:`);
        console.log(`  - Popularity: ${past.popularity} → ${current.popularity} (${popChange > 0 ? '+' : ''}${popChange})`);
        console.log(`  - Followers: ${past.followers} → ${current.followers} (${followerChange > 0 ? '+' : ''}${followerChange.toFixed(1)}%)`);
      }
    }
    
    console.log('\nHistorical data generation complete!');
    console.log('Artists should now appear on the leaderboard.');
    
  } catch (error) {
    console.error('Error generating historical data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateHistoricalData();