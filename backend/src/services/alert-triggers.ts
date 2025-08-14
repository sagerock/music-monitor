import { prisma } from '../db/client';

export class AlertTriggerService {
  /**
   * Trigger comment alerts when a new comment is posted
   */
  async triggerCommentAlerts(artistId: string, commenterId: string, commentContent: string) {
    try {
      // Find all active comment alerts for this artist (excluding the commenter)
      const alerts = await prisma.alert.findMany({
        where: {
          artistId,
          alertType: 'comment',
          isActive: true,
          userId: {
            not: commenterId, // Don't notify user of their own comments
          },
        },
        include: {
          user: true,
          artist: true,
        },
      });

      // Create notifications for each user with an alert
      for (const alert of alerts) {
        await prisma.notification.create({
          data: {
            userId: alert.userId,
            type: 'artist_comment',
            title: `New comment on ${alert.artist.name}`,
            message: `Someone commented on ${alert.artist.name}: "${commentContent.slice(0, 100)}${commentContent.length > 100 ? '...' : ''}"`,
            data: {
              artistId,
              commenterId,
              alertId: alert.id.toString(),
            },
          },
        });

        // Update last triggered timestamp
        await prisma.alert.update({
          where: { id: alert.id },
          data: { lastTriggered: new Date() },
        });
      }

      return alerts.length;
    } catch (error) {
      console.error('Error triggering comment alerts:', error);
      return 0;
    }
  }

  /**
   * Trigger rating alerts when a new rating is posted
   */
  async triggerRatingAlerts(artistId: string, raterId: string, rating: number, review?: string) {
    try {
      // Find all active rating alerts for this artist (excluding the rater)
      const alerts = await prisma.alert.findMany({
        where: {
          artistId,
          alertType: 'rating',
          isActive: true,
          userId: {
            not: raterId, // Don't notify user of their own ratings
          },
        },
        include: {
          user: true,
          artist: true,
        },
      });

      // Create notifications for each user with an alert
      for (const alert of alerts) {
        const reviewText = review ? `: "${review.slice(0, 100)}${review.length > 100 ? '...' : ''}"` : '';
        await prisma.notification.create({
          data: {
            userId: alert.userId,
            type: 'artist_rating',
            title: `New rating for ${alert.artist.name}`,
            message: `Someone rated ${alert.artist.name} ${rating} stars${reviewText}`,
            data: {
              artistId,
              raterId,
              rating,
              alertId: alert.id.toString(),
            },
          },
        });

        // Update last triggered timestamp
        await prisma.alert.update({
          where: { id: alert.id },
          data: { lastTriggered: new Date() },
        });
      }

      return alerts.length;
    } catch (error) {
      console.error('Error triggering rating alerts:', error);
      return 0;
    }
  }

  /**
   * Trigger momentum alerts (existing functionality)
   */
  async triggerMomentumAlerts(artistId: string, currentMomentum: number) {
    try {
      const alerts = await prisma.alert.findMany({
        where: {
          artistId,
          alertType: 'momentum',
          isActive: true,
          threshold: {
            lte: currentMomentum,
          },
        },
        include: {
          user: true,
          artist: true,
        },
      });

      for (const alert of alerts) {
        // Only trigger if not recently triggered (e.g., within last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (alert.lastTriggered && alert.lastTriggered > oneDayAgo) {
          continue;
        }

        await prisma.notification.create({
          data: {
            userId: alert.userId,
            type: 'momentum_threshold',
            title: `Momentum Alert: ${alert.artist.name}`,
            message: `${alert.artist.name}'s momentum score (${currentMomentum.toFixed(1)}) has exceeded your threshold of ${alert.threshold}`,
            data: {
              artistId,
              momentum: currentMomentum,
              threshold: alert.threshold,
              alertId: alert.id.toString(),
            },
          },
        });

        await prisma.alert.update({
          where: { id: alert.id },
          data: { lastTriggered: new Date() },
        });
      }

      return alerts.length;
    } catch (error) {
      console.error('Error triggering momentum alerts:', error);
      return 0;
    }
  }
}

export const alertTriggerService = new AlertTriggerService();