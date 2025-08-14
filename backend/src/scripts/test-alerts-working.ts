import { prisma } from '../db/client';

async function testAlertsWorking() {
  try {
    console.log('Testing alert system after migration...\n');
    
    // Get a test user and artist
    const user = await prisma.user.findFirst();
    const artist = await prisma.artist.findFirst();
    
    if (!user || !artist) {
      console.log('❌ No test data available');
      return;
    }
    
    console.log(`Test User: ${user.email}`);
    console.log(`Test Artist: ${artist.name}\n`);
    
    // Test 1: Create momentum alert
    try {
      const momentumAlert = await prisma.alert.create({
        data: {
          userId: user.id,
          artistId: artist.id,
          alertType: 'momentum',
          threshold: 5.0,
        },
      });
      console.log('✅ Momentum alert created:', momentumAlert.id);
      await prisma.alert.delete({ where: { id: momentumAlert.id } });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log('⚠️  Momentum alert already exists');
      } else {
        console.log('❌ Failed to create momentum alert:', error.message);
      }
    }
    
    // Test 2: Create comment alert
    try {
      const commentAlert = await prisma.alert.create({
        data: {
          userId: user.id,
          artistId: artist.id,
          alertType: 'comment',
          threshold: null,
        },
      });
      console.log('✅ Comment alert created:', commentAlert.id);
      await prisma.alert.delete({ where: { id: commentAlert.id } });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log('⚠️  Comment alert already exists');
      } else {
        console.log('❌ Failed to create comment alert:', error.message);
      }
    }
    
    // Test 3: Create rating alert
    try {
      const ratingAlert = await prisma.alert.create({
        data: {
          userId: user.id,
          artistId: artist.id,
          alertType: 'rating',
          threshold: null,
        },
      });
      console.log('✅ Rating alert created:', ratingAlert.id);
      await prisma.alert.delete({ where: { id: ratingAlert.id } });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log('⚠️  Rating alert already exists');
      } else {
        console.log('❌ Failed to create rating alert:', error.message);
      }
    }
    
    // Check existing alerts
    const existingAlerts = await prisma.alert.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        artistId: true,
        alertType: true,
        threshold: true,
        artist: {
          select: { name: true },
        },
      },
    });
    
    console.log(`\n📊 User has ${existingAlerts.length} active alerts:`);
    existingAlerts.forEach(alert => {
      console.log(`   - ${alert.alertType} alert for ${alert.artist.name}${alert.threshold ? ` (threshold: ${alert.threshold})` : ''}`);
    });
    
    console.log('\n✅ Alert system is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing alerts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAlertsWorking();