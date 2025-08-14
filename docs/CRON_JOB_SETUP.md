# Setting Up Automated Social Stats Updates

## Option 1: Render Native Cron Jobs (FREE - Recommended)

### Steps:
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Cron Job"**
3. Configure:
   - **Name**: `music-monitor-social-update`
   - **Command**: 
     ```bash
     curl -X POST https://music-monitor.onrender.com/api/jobs/update-social-stats \
       -H "secret: cronJobSecret123"
     ```
   - **Schedule**: `0 3 * * *` (Daily at 3 AM UTC)
   - **Runtime**: Docker or Native
   - **Plan**: Free

4. Click **"Create Cron Job"**

### Alternative Schedules:
- `0 */6 * * *` - Every 6 hours
- `0 3 * * *` - Daily at 3 AM UTC
- `0 0,12 * * *` - Twice daily (midnight and noon)

## Option 2: GitHub Actions (FREE)

Create `.github/workflows/update-social-stats.yml`:

```yaml
name: Update Social Stats

on:
  schedule:
    - cron: '0 3 * * *'  # Daily at 3 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Social Stats Update
        run: |
          curl -X POST https://music-monitor.onrender.com/api/jobs/update-social-stats \
            -H "secret: cronJobSecret123" \
            -f
```

Then commit and push to GitHub.

## Option 3: External Cron Services (FREE)

### Cron-job.org (Recommended)
1. Go to [cron-job.org](https://cron-job.org)
2. Sign up for free account
3. Create new cron job:
   - **URL**: `https://music-monitor.onrender.com/api/jobs/update-social-stats`
   - **Schedule**: Every day at 3:00
   - **Request Method**: POST
   - **Request Headers**: 
     ```
     secret: cronJobSecret123
     ```

### UptimeRobot (Also keeps your app awake!)
1. Go to [UptimeRobot](https://uptimerobot.com)
2. Create free account (50 monitors free)
3. Add new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://music-monitor.onrender.com/api/jobs/update-social-stats`
   - **Monitoring Interval**: 60 minutes
   - **Request Type**: POST
   - **HTTP Headers**: `secret: cronJobSecret123`

## Option 4: Vercel Cron Jobs (If using Vercel)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/trigger-social-update",
    "schedule": "0 3 * * *"
  }]
}
```

Then create `/api/trigger-social-update.ts` that calls your backend.

## Which Should You Choose?

### For Simplicity: **Render Cron Jobs**
- Already integrated with your backend
- No external services needed
- Free tier available
- Easy to monitor in Render dashboard

### For Reliability: **GitHub Actions**
- Very reliable
- Free for public repos
- Easy to modify
- Good logging

### For Keeping App Awake: **UptimeRobot**
- Prevents Render from sleeping
- Also monitors uptime
- Free tier generous

## Testing Your Cron Job

After setting up, test manually:
```bash
curl -X POST https://music-monitor.onrender.com/api/jobs/update-social-stats \
  -H "secret: cronJobSecret123"
```

Should return:
```json
{"success":true,"message":"Social stats update started"}
```

## Monitoring

Check if updates are running:
1. Look at the `lastFetched` field in social links
2. Check Render logs for "Social stats update complete"
3. After 2-3 days, check momentum scores for social growth data

## Recommended Schedule

**Daily at 3 AM UTC** is ideal because:
- Low traffic time
- Consistent 24-hour intervals for growth calculation
- Enough data points without hitting API limits
- Apify free credits last ~400 updates/month