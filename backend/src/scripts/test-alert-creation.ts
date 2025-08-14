import { prisma } from '../db/client';

async function testAlertCreation() {
  try {
    // Get a sample artist and user
    const artist = await prisma.artist.findFirst();
    const user = await prisma.user.findFirst();
    
    if (!artist || !user) {
      console.log('Need at least one artist and user in database');
      return;
    }
    
    console.log('Testing alert creation for:');
    console.log('Artist:', artist.id, artist.name);
    console.log('User:', user.id, user.email);
    
    // Check for existing alert
    const existing = await prisma.alert.findFirst({
      where: {
        userId: user.id,
        artistId: artist.id,
        isActive: true,
      },
    });
    
    if (existing) {
      console.log('Active alert already exists');
      return;
    }
    
    // Try to create an alert
    try {
      const alert = await prisma.alert.create({
        data: {
          userId: user.id,
          artistId: artist.id,
          threshold: 5,
        },
      });
      
      console.log('Alert created successfully:', alert);
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAlertCreation();