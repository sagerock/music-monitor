import { prisma } from '../db/client';
import { youtubeService } from '../services/youtube';
import { simpleInstagramService } from '../services/instagram-simple';

export async function updateSocialStats() {
  const startTime = Date.now();
  
  try {
    console.log('Starting social media stats update job...');
    
    // Log job start
    const jobLog = await prisma.jobLog.create({
      data: {
        jobName: 'update-social-stats',
        status: 'running',
        message: 'Updating social media statistics',
        startedAt: new Date(),
      },
    });

    try {
      // Update YouTube stats
      await youtubeService.updateAllYouTubeStats();
      
      // Update Instagram stats with simplified scraper
      await simpleInstagramService.updateAllInstagramStats();
      
      // In the future, we can add other platforms here:
      // await tiktokService.updateAllTikTokStats();

      // Clean up browser instance
      await simpleInstagramService.cleanup();

      const duration = Date.now() - startTime;
      
      // Update job log with success
      await prisma.jobLog.update({
        where: { id: jobLog.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          message: `Social stats updated successfully in ${duration}ms`,
        },
      });

      console.log(`✓ Social stats update completed in ${duration}ms`);
    } catch (error) {
      // Update job log with error
      await prisma.jobLog.update({
        where: { id: jobLog.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          message: 'Failed to update social stats',
          errorDetails: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        },
      });
      
      throw error;
    }
  } catch (error) {
    console.error('Error in social stats update job:', error);
    throw error;
  }
}