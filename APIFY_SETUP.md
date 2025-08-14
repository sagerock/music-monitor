# Apify Integration Setup Guide

## Overview
Music Monitor now supports Apify for robust social media scraping of Instagram, TikTok, and YouTube (as fallback).

## Why Apify?
- **No infrastructure needed** - Runs in Apify's cloud
- **Maintained scrapers** - Automatically updated when sites change
- **Built-in proxy rotation** - Avoids blocks
- **Free tier available** - $5 credits/month (enough for ~12,500 profiles)
- **Works on Render free tier** - No Docker/headless browser needed

## Setup Instructions

### 1. Create Apify Account
1. Go to [Apify.com](https://apify.com)
2. Sign up for free account (includes $5 monthly credits)
3. Go to Settings → Integrations → API tokens
4. Create a new API token

### 2. Add Environment Variable

**Local Development (.env):**
```bash
APIFY_API_TOKEN=apify_api_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Production (Render):**
1. Go to Render dashboard
2. Select your music-monitor service  
3. Go to Environment tab
4. Add:
   ```
   APIFY_API_TOKEN=apify_api_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
5. Save and redeploy

### 3. Verify Setup

Check backend logs for:
```
Apify service initialized
YouTube service: Apify fallback enabled
Using Apify scrapers
```

If you see "Apify service disabled - no API token provided", check your environment variable.

## What Gets Scraped

### Instagram (via Apify)
- Follower count
- Following count  
- Posts count
- Verification status
- Bio
- Profile picture

### TikTok (via Apify)
- Follower count
- Following count
- Likes count
- Video count
- Verification status
- Nickname
- Avatar

### YouTube
- Primary: YouTube Data API (if API key configured)
- Fallback: Apify scraper (if API fails or quota exceeded)
- Subscriber count
- View count
- Video count
- Channel description

## Cost Estimation

With Apify's free tier ($5/month):
- Instagram: ~$0.40 per 1000 profiles
- TikTok: ~$0.30 per 1000 profiles
- YouTube: ~$0.35 per 1000 channels

**Free tier allows approximately:**
- 12,500 Instagram profiles/month OR
- 16,600 TikTok profiles/month OR  
- 14,200 YouTube channels/month
- Or a mix of all three

## Testing

### Manual Test
```bash
# Trigger social stats update
curl -X POST http://localhost:3001/api/jobs/update-social-stats \
  -H "secret: cronJobSecret123"
```

### Add Test Social Links
1. Add an artist's Instagram/TikTok links in the UI
2. Run the update job
3. Check if follower counts appear

## Troubleshooting

### "Apify service disabled"
- Check APIFY_API_TOKEN is set correctly
- Restart backend after adding environment variable

### Scraping returns null
- Check Apify dashboard for actor run status
- Verify you have credits remaining
- Check if the social media URL is valid

### Rate limits
- Apify handles rate limiting automatically
- Our code adds additional delays between requests
- If hitting limits, reduce batch size in PQueue settings

## Monitoring Usage

1. Go to [Apify Console](https://console.apify.com)
2. Check Settings → Billing for credit usage
3. Monitor Actors → Runs for execution history

## Fallback Behavior

If Apify is not configured or fails:
- **YouTube**: Falls back to YouTube Data API (if configured)
- **Instagram**: Falls back to simple scraper (limited, may not work on Render)
- **TikTok**: Disabled (no fallback available)

## Production Notes

- Apify works perfectly on Render's free tier
- No Docker or headless browser required
- More reliable than self-hosted scraping
- Automatically handles anti-scraping measures

## Support

- [Apify Documentation](https://docs.apify.com)
- [Instagram Scraper Actor](https://apify.com/apify/instagram-scraper)
- [TikTok Scraper Actor](https://apify.com/apify/tiktok-scraper)
- [YouTube Scraper Actor](https://apify.com/apify/youtube-scraper)