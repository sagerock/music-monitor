import { prisma } from '../db/client';
import { youtubeService } from '../services/youtube';
import { instagramService } from '../services/instagram';
import { tiktokService } from '../services/tiktok';
import { twitterService } from '../services/twitter';
import { facebookService } from '../services/facebook';
import { simpleInstagramService } from '../services/instagram-simple';
import { apifyService } from '../services/apify';

export async function updateSocialStats() {
  const startTime = Date.now();
  
  try {
    console.log('Starting social media stats update job...');
    
    // Check which services are available
    const useApify = apifyService.isEnabled();
    console.log(`Using ${useApify ? 'Apify' : 'built-in'} scrapers`);
    
    // Log job start
    const jobLog = await prisma.jobLog.create({
      data: {
        jobName: 'update-social-stats',
        status: 'running',
        message: `Updating social media statistics (${useApify ? 'Apify' : 'built-in'})`,
        startedAt: new Date(),
      },
    });

    try {
      // Update YouTube stats (uses Apify as fallback if available)
      await youtubeService.updateAllYouTubeStats();

      if (useApify) {
        // Use Apify-powered scrapers
        await instagramService.updateAllInstagramStats();
        await tiktokService.updateAllTikTokStats();
        await facebookService.updateAllFacebookStats();
        await twitterService.updateAllTwitterStats();
      } else {
        // Fallback to simple Instagram scraper (limited functionality)
        console.log('Apify not configured - Instagram scraping limited, TikTok/Facebook/Twitter disabled');
        await simpleInstagramService.updateAllInstagramStats();
      }

      // Clean up if using simple scraper
      if (!useApify) {
        await simpleInstagramService.cleanup();
      }

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
          errorDetails: error instanceof Error ? { message: error.message, stack: error.stack } : (error as any),
        },
      });
      
      throw error;
    }
  } catch (error) {
    console.error('Error in social stats update job:', error);
    throw error;
  }
}