import { prisma } from '../db/client';
import { alertTriggerService } from '../services/alert-triggers';

async function testNotificationTriggers() {
  try {
    console.log('Testing notification triggers...\n');
    
    // Get test data
    const users = await prisma.user.findMany({ take: 2 });
    const artist = await prisma.artist.findFirst();
    
    if (users.length < 2 || !artist) {
      console.log('Need at least 2 users and 1 artist for testing');
      return;
    }
    
    const user1 = users[0]; // This user will create alerts
    const user2 = users[1]; // This user will comment/rate
    
    console.log(`User 1 (alert creator): ${user1.email}`);
    console.log(`User 2 (commenter/rater): ${user2.email}`);
    console.log(`Artist: ${artist.name}\n`);
    
    // Step 1: Create comment and rating alerts for user1
    console.log('Step 1: Creating alerts for user1...');
    
    // Create comment alert
    try {
      await prisma.alert.create({
        data: {
          userId: user1.id,
          artistId: artist.id,
          alertType: 'comment',
          threshold: null,
        },
      });
      console.log('✅ Comment alert created');
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log('⚠️  Comment alert already exists');
      } else {
        console.log('❌ Failed to create comment alert:', error.message);
      }
    }
    
    // Create rating alert
    try {
      await prisma.alert.create({
        data: {
          userId: user1.id,
          artistId: artist.id,
          alertType: 'rating',
          threshold: null,
        },
      });
      console.log('✅ Rating alert created');
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log('⚠️  Rating alert already exists');
      } else {
        console.log('❌ Failed to create rating alert:', error.message);
      }
    }
    
    // Step 2: Simulate user2 commenting
    console.log('\nStep 2: User2 posts a comment...');
    const comment = await prisma.comment.create({
      data: {
        userId: user2.id,
        artistId: artist.id,
        content: 'This artist is amazing! Love their latest track.',
      },
    });
    
    // Trigger comment alerts
    const commentAlertsTriggered = await alertTriggerService.triggerCommentAlerts(
      artist.id,
      user2.id,
      comment.content
    );
    console.log(`✅ Comment created, ${commentAlertsTriggered} alerts triggered`);
    
    // Step 3: Simulate user2 rating
    console.log('\nStep 3: User2 rates the artist...');
    const rating = await prisma.rating.upsert({
      where: {
        artistId_userId: {
          artistId: artist.id,
          userId: user2.id,
        },
      },
      create: {
        userId: user2.id,
        artistId: artist.id,
        rating: 5,
        review: 'Absolutely fantastic! One of my favorite artists.',
      },
      update: {
        rating: 5,
        review: 'Absolutely fantastic! One of my favorite artists.',
      },
    });
    
    // Trigger rating alerts
    const ratingAlertsTriggered = await alertTriggerService.triggerRatingAlerts(
      artist.id,
      user2.id,
      rating.rating,
      rating.review || undefined
    );
    console.log(`✅ Rating created, ${ratingAlertsTriggered} alerts triggered`);
    
    // Step 4: Check notifications for user1
    console.log('\nStep 4: Checking notifications for user1...');
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user1.id,
        read: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    console.log(`\n📬 User1 has ${notifications.length} unread notifications:`);
    notifications.forEach(notif => {
      console.log(`   - [${notif.type}] ${notif.title}`);
      console.log(`     "${notif.message}"`);
    });
    
    // Clean up test data (optional)
    console.log('\nCleaning up test data...');
    await prisma.comment.delete({ where: { id: comment.id } });
    await prisma.rating.delete({ 
      where: { 
        artistId_userId: {
          artistId: artist.id,
          userId: user2.id,
        }
      } 
    });
    
    console.log('\n✅ Test completed! Check the notifications bell in the header.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationTriggers();