# Simple Cron Job Setup (No Code Required!)

## Recommended: cron-job.org (100% FREE)

### Step-by-Step:

1. **Go to [cron-job.org](https://cron-job.org/en/)**

2. **Sign up** for a free account

3. **Click "CREATE CRONJOB"**

4. **Fill in the details:**
   - **Title**: `Music Monitor Social Update`
   - **URL**: `https://music-monitor.onrender.com/api/jobs/update-social-stats`
   - **Schedule**: 
     - Select "Every Day"
     - Time: "03:00" (or any time you prefer)
   - **Notifications**: Turn OFF (unless you want emails)

5. **Click "CREATE"**

6. **Edit the job** to add the authentication header:
   - Find your created job
   - Click on it to edit
   - Go to **"Advanced"** tab
   - Under **"Headers"**, add:
     ```
     secret: cronJobSecret123
     ```
   - **Request Method**: POST
   - Save

### That's it! No code needed!

## Alternative: UptimeRobot (Also Keeps Render Awake!)

1. **Go to [UptimeRobot](https://uptimerobot.com)**
2. **Sign up** for free (50 monitors included)
3. **Add New Monitor**:
   - Monitor Type: **HTTP(s)**
   - Friendly Name: `Music Monitor Social Update`
   - URL: `https://music-monitor.onrender.com/api/jobs/update-social-stats`
   - Monitoring Interval: **60 minutes**
   - Monitor Timeout: **30 seconds**
   - HTTP Method: **POST**
   - HTTP Headers:
     ```
     secret: cronJobSecret123
     ```

**Bonus**: UptimeRobot will also keep your Render service from going to sleep!

## Testing Your Setup

Run this command to test immediately:
```bash
curl -X POST https://music-monitor.onrender.com/api/jobs/update-social-stats \
  -H "secret: cronJobSecret123"
```

## What Happens Next?

1. **Day 1**: First snapshot of follower counts
2. **Day 2**: Second snapshot, growth calculation starts
3. **Day 3+**: Full momentum analysis with social growth trends

The cron job will run automatically every day, updating:
- ✅ Instagram follower counts
- ✅ TikTok follower counts
- ✅ YouTube subscriber counts
- ✅ Calculate growth percentages
- ✅ Update momentum scores

## Cost Analysis

With daily updates:
- **30 artists × 3 platforms = 90 scrapes/day**
- **Monthly: ~2,700 scrapes**
- **Apify free tier: $5 credits ≈ 12,500 scrapes**
- **You're using: ~22% of free tier**

Plenty of room to grow!