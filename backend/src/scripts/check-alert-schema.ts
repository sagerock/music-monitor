import { prisma } from '../db/client';

async function checkAlertSchema() {
  try {
    // Try to create a test alert with alertType
    const testUser = await prisma.user.findFirst();
    const testArtist = await prisma.artist.findFirst();
    
    if (!testUser || !testArtist) {
      console.log('No test data available');
      return;
    }
    
    console.log('Testing alert creation with new schema...');
    
    try {
      const alert = await prisma.alert.create({
        data: {
          userId: testUser.id,
          artistId: testArtist.id,
          alertType: 'test',
          threshold: 5,
        },
      });
      
      console.log('✅ Alert created with alertType:', alert);
      
      // Clean up
      await prisma.alert.delete({
        where: { id: alert.id },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log('❌ Unique constraint violation - alert already exists');
      } else if (error.message.includes('Unknown argument')) {
        console.log('❌ alertType field does not exist in database');
        console.log('Run this SQL in Supabase:');
        console.log(`
ALTER TABLE "alerts" 
ADD COLUMN IF NOT EXISTS "alert_type" TEXT DEFAULT 'momentum';

ALTER TABLE "alerts" 
ALTER COLUMN "threshold" DROP NOT NULL;
        `);
      } else {
        console.log('❌ Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAlertSchema();