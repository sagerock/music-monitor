import cron from 'node-cron';
import { refreshNewReleases } from './refresh-new-releases';
import { snapshotArtists } from './snapshot-artists';
import { checkAlerts } from './check-alerts';
import { updateSocialStats } from './update-social-stats';

export function startCronJobs() {
  console.log('Starting cron jobs...');

  cron.schedule('0 7 * * *', async () => {
    console.log('Running refresh-new-releases job');
    try {
      await refreshNewReleases();
    } catch (error) {
      console.error('refresh-new-releases job failed:', error);
    }
  }, {
    timezone: 'UTC',
  });

  cron.schedule('10 7 * * *', async () => {
    console.log('Running snapshot-artists job');
    try {
      await snapshotArtists();
    } catch (error) {
      console.error('snapshot-artists job failed:', error);
    }
  }, {
    timezone: 'UTC',
  });

  cron.schedule('30 7 * * *', async () => {
    console.log('Running check-alerts job');
    try {
      await checkAlerts();
    } catch (error) {
      console.error('check-alerts job failed:', error);
    }
  }, {
    timezone: 'UTC',
  });

  // Run social stats update once a day at 8 AM UTC
  cron.schedule('0 8 * * *', async () => {
    console.log('Running update-social-stats job');
    try {
      await updateSocialStats();
    } catch (error) {
      console.error('update-social-stats job failed:', error);
    }
  }, {
    timezone: 'UTC',
  });

  console.log('Cron jobs scheduled successfully');
}