import { prisma } from '../db/client';

async function generateMoreHistory() {
  console.log('Generating extended historical data (365 days)...');
  
  try {
    const artists = await prisma.artist.findMany();
    console.log(`Found ${artists.length} artists`);
    
    for (const artist of artists) {
      console.log(`Processing ${artist.name}...`);
      
      // Get earliest existing snapshot
      const earliestSnapshot = await prisma.snapshot.findFirst({
        where: { artistId: artist.id },
        orderBy: { snapshotDate: 'asc' },
      });
      
      if (!earliestSnapshot) {
        console.log(`  - No snapshots found, skipping`);
        continue;
      }
      
      // Check how many days of history we have
      const today = new Date();
      const earliestDate = new Date(earliestSnapshot.snapshotDate);
      const daysDiff = Math.floor((today.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 365) {
        console.log(`  - Already has ${daysDiff} days of history`);
        continue;
      }
      
      // Generate snapshots from 365 days ago to earliest existing
      const snapshots = [];
      const startDaysAgo = 365;
      const endDaysAgo = daysDiff + 1;
      
      for (let daysAgo = startDaysAgo; daysAgo >= endDaysAgo; daysAgo--) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        
        // Create more realistic growth patterns
        const yearProgress = (365 - daysAgo) / 365;
        
        // Different growth patterns for different time periods
        let growthMultiplier = 1;
        
        if (daysAgo > 180) {
          // Slow growth in the distant past
          growthMultiplier = 0.7 + (yearProgress * 0.1);
        } else if (daysAgo > 90) {
          // Moderate growth
          growthMultiplier = 0.8 + (yearProgress * 0.15);
        } else if (daysAgo > 30) {
          // Faster recent growth
          growthMultiplier = 0.85 + (yearProgress * 0.12);
        } else {
          // Skip recent dates (already have data)
          continue;
        }
        
        // Add some seasonal variation (higher in summer/winter)
        const month = date.getMonth();
        const seasonalBoost = (month >= 5 && month <= 7) || (month >= 11 || month <= 1) 
          ? 1.05 
          : 0.98;
        
        // Add weekly variation (higher on weekends)
        const dayOfWeek = date.getDay();
        const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.02 : 0.99;
        
        // Random daily variation
        const randomVariation = 0.95 + Math.random() * 0.1;
        
        const finalMultiplier = growthMultiplier * seasonalBoost * weekendBoost * randomVariation;
        
        const popularity = artist.popularity 
          ? Math.round(artist.popularity * finalMultiplier)
          : null;
          
        const followers = artist.followers 
          ? BigInt(Math.round(Number(artist.followers) * finalMultiplier))
          : null;
        
        // TikTok mentions with viral spikes
        const viralChance = Math.random();
        const tiktokBase = Math.floor(Math.random() * 500 * growthMultiplier);
        const tiktokMentions = viralChance > 0.95 
          ? tiktokBase * 10  // Viral spike!
          : tiktokBase;
        
        const playlistCount = Math.floor(Math.random() * 25 * growthMultiplier);
        
        snapshots.push({
          artistId: artist.id,
          snapshotDate: date,
          popularity: Math.min(100, Math.max(0, popularity || 0)),
          followers,
          tiktokMentions,
          playlistCount,
        });
      }
      
      if (snapshots.length > 0) {
        await prisma.snapshot.createMany({
          data: snapshots,
          skipDuplicates: true,
        });
        console.log(`  - Created ${snapshots.length} historical snapshots`);
      }
    }
    
    // Show momentum for different time periods
    console.log('\nMomentum scores for different periods:');
    
    const periods = [
      { days: 1, label: '24 hours' },
      { days: 7, label: '7 days' },
      { days: 30, label: '30 days' },
      { days: 90, label: '90 days' },
      { days: 180, label: '180 days' },
      { days: 365, label: '1 year' },
    ];
    
    for (const artist of artists) {
      console.log(`\n${artist.name}:`);
      
      for (const period of periods) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period.days);
        
        const snapshots = await prisma.snapshot.findMany({
          where: {
            artistId: artist.id,
            snapshotDate: { gte: startDate },
          },
          orderBy: { snapshotDate: 'desc' },
          take: 2,
        });
        
        if (snapshots.length >= 2) {
          const [current, past] = snapshots;
          const popChange = (current.popularity || 0) - (past.popularity || 0);
          const followerChange = past.followers && past.followers > 0n
            ? (Number(current.followers || 0n) - Number(past.followers)) / Number(past.followers) * 100
            : 0;
          
          console.log(`  ${period.label}: Pop ${popChange > 0 ? '+' : ''}${popChange}, Followers ${followerChange > 0 ? '+' : ''}${followerChange.toFixed(1)}%`);
        }
      }
    }
    
    console.log('\nExtended historical data generation complete!');
    
  } catch (error) {
    console.error('Error generating historical data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateMoreHistory();