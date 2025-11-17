import { prisma } from '../db/client';
import { momentumService } from '../services/momentum';
import sgMail from '@sendgrid/mail';
import { config } from '../config';

// Configure SendGrid
if (config.SENDGRID_API_KEY) {
  sgMail.setApiKey(config.SENDGRID_API_KEY);
}

export async function checkAlerts() {
  const startTime = new Date();
  let checkedCount = 0;
  let triggeredCount = 0;

  try {
    await prisma.jobLog.create({
      data: {
        jobName: 'check-alerts',
        status: 'running',
        startedAt: startTime,
      },
    });

    // Only get momentum alerts
    const activeAlerts = await prisma.alert.findMany({
      where: { 
        isActive: true,
        // Just check for momentum type - old alerts should be updated by now
        alertType: 'momentum'
      },
      include: {
        user: true,
        artist: true,
      },
    });

    for (const alert of activeAlerts) {
      try {
        // Skip if no threshold (shouldn't happen for momentum alerts, but be safe)
        if (alert.threshold === null) {
          continue;
        }
        
        const momentum = await momentumService.getArtistMomentum(alert.artistId, 14);
        
        if (momentum && momentum.momentumScore >= alert.threshold) {
          const lastTriggered = alert.lastTriggered;
          const daysSinceLastTrigger = lastTriggered
            ? (Date.now() - lastTriggered.getTime()) / (1000 * 60 * 60 * 24)
            : Infinity;

          if (daysSinceLastTrigger > 7) {
            if (config.SENDGRID_API_KEY) {
              await sgMail.send({
                from: {
                  email: config.SENDGRID_FROM_EMAIL,
                  name: 'A&R Club Alerts'
                },
                to: alert.user.email,
                subject: `Momentum Alert: ${alert.artist.name}`,
                html: `
                  <h2>Momentum Alert for ${alert.artist.name}</h2>
                  <p>Great news! ${alert.artist.name} has reached a momentum score of ${momentum.momentumScore.toFixed(2)}.</p>
                  <ul>
                    <li>Current Popularity: ${momentum.currentPopularity}</li>
                    <li>Current Followers: ${momentum.currentFollowers.toLocaleString()}</li>
                    <li>Popularity Change: ${momentum.deltaPopularity > 0 ? '+' : ''}${momentum.deltaPopularity}</li>
                    <li>Follower Growth: ${momentum.deltaFollowersPct > 0 ? '+' : ''}${(momentum.deltaFollowersPct * 100).toFixed(1)}%</li>
                  </ul>
                  <p><a href="${config.FRONTEND_URL}/artist/${alert.artistId}">View Artist Details</a></p>
                `,
              });
            }

            await prisma.alert.update({
              where: { id: alert.id },
              data: { lastTriggered: new Date() },
            });

            triggeredCount++;
          }
        }

        checkedCount++;
      } catch (error) {
        console.error(`Error checking alert ${alert.id}:`, error);
      }
    }

    await prisma.jobLog.create({
      data: {
        jobName: 'check-alerts',
        status: 'completed',
        message: `Checked ${checkedCount} alerts, triggered ${triggeredCount}`,
        startedAt: startTime,
        completedAt: new Date(),
      },
    });

    return {
      checkedCount,
      triggeredCount,
      duration: Date.now() - startTime.getTime(),
    };
  } catch (error) {
    await prisma.jobLog.create({
      data: {
        jobName: 'check-alerts',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        startedAt: startTime,
        completedAt: new Date(),
        errorDetails: error instanceof Error ? { message: error.message, stack: error.stack } : {},
      },
    });

    throw error;
  }
}