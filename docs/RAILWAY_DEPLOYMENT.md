# Railway Deployment Guide

This guide walks you through deploying Music Monitor to production using Railway for the backend and Vercel for the frontend.

## Prerequisites

- [Railway Account](https://railway.app/) (free tier available)
- [Vercel Account](https://vercel.com/) (free tier available)
- GitHub account with Music Monitor repository
- Supabase project (already configured at `mpskjkezcifsameyfxzz.supabase.co`)

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Vercel    │─────▶│  Railway Backend │─────▶│  Supabase   │
│  (Frontend) │      │   (Fastify API)  │      │ (PostgreSQL)│
└─────────────┘      └──────────────────┘      └─────────────┘
     Next.js              Port: 3001              Database
                                                  + Auth
                                                  + Storage
```

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app/) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select your `music-monitor` repository
6. Railway will automatically detect the `railway.json` configuration

### Step 2: Configure Environment Variables

In your Railway project dashboard, go to **Variables** tab and add the following:

#### Required Variables

```bash
# Database
DATABASE_URL=postgresql://postgres.mpskjkezcifsameyfxzz:bsHxBZ0nkCdfVqTU@aws-0-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=10&pool_timeout=30

# Spotify API
SPOTIFY_CLIENT_ID=9284da7cf454497ab5982f11970071f0
SPOTIFY_CLIENT_SECRET=75f695f020654f539af63f404bfc949d

# Authentication
JWT_SECRET=supersecretjwtkey123456789

# Supabase
SUPABASE_URL=https://mpskjkezcifsameyfxzz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc2tqa2V6Y2lmc2FtZXlmeHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyOTMwOSwiZXhwIjoyMDcwNjA1MzA5fQ.iQ92Ju4O-Ht6XEhfQdToor5_ftA-JEsGAMWZabOT-NQ

# Cron Jobs
CRON_JOB_SECRET=cronJobSecret123

# Frontend URL (you'll update this after deploying frontend)
FRONTEND_URL=https://music-monitor.vercel.app

# Node Environment
NODE_ENV=production
LOG_LEVEL=info
```

#### Optional Variables (for additional features)

```bash
# YouTube Data (for YouTube stats)
YOUTUBE_API_KEY=AIzaSyAQZMVKaCQlbGEUtajAoSm1a4gzqlOOvu0

# Email notifications (optional)
RESEND_API_KEY=your_resend_api_key

# TikTok scraping (optional)
APIFY_TOKEN=your_apify_token
```

### Step 3: Deploy Backend

1. Railway will automatically start deploying after you add variables
2. Watch the build logs in the **Deployments** tab
3. The build process will:
   - Install dependencies with `pnpm`
   - Compile TypeScript
   - Generate Prisma client
   - Run database migrations
   - Start the server on Railway's assigned port

4. Once deployed, Railway will provide you with a URL like:
   ```
   https://your-project-name.up.railway.app
   ```

5. **Save this URL** - you'll need it for the frontend configuration

### Step 4: Verify Backend Deployment

Test your backend by visiting these endpoints:

```bash
# Health check
curl https://your-project-name.up.railway.app/health

# Expected response:
# {"status":"ok"}

# Test database connection
curl https://your-project-name.up.railway.app/api/artists?limit=5

# Should return artist data if database is connected
```

### Step 5: Configure Cron Jobs (Optional)

Railway supports scheduled tasks via Railway Cron or you can use external services:

**Option A: Railway Cron (Recommended)**
1. In Railway dashboard, go to **Cron** tab
2. Add the following schedules:

```
# Refresh new releases daily at 6 AM UTC
0 6 * * * curl -X POST https://your-project-name.up.railway.app/api/jobs/refresh-new-releases -H "secret: cronJobSecret123"

# Snapshot artists hourly
0 * * * * curl -X POST https://your-project-name.up.railway.app/api/jobs/snapshot-artists -H "secret: cronJobSecret123"

# Check alerts every 30 minutes
*/30 * * * * curl -X POST https://your-project-name.up.railway.app/api/jobs/check-alerts -H "secret: cronJobSecret123"

# Update social stats daily at 3 AM UTC
0 3 * * * curl -X POST https://your-project-name.up.railway.app/api/jobs/update-social-stats -H "secret: cronJobSecret123"
```

**Option B: External Cron Service**
Use services like:
- [Cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com/)
- GitHub Actions workflows

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend

The frontend is already configured for Vercel deployment. The project ID in `.vercel/project.json` is already set.

### Step 2: Configure Frontend Environment Variables

In Vercel dashboard, go to your project settings → **Environment Variables** and add:

```bash
# Supabase (same as backend)
NEXT_PUBLIC_SUPABASE_URL=https://mpskjkezcifsameyfxzz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc2tqa2V6Y2lmc2FtZXlmeHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjkzMDksImV4cCI6MjA3MDYwNTMwOX0.nWMCbFyrqHv7LD4wMgLss1kA3Fcp9TRV0aDX2KhvdX8

# Backend API URL (from Railway deployment)
NEXT_PUBLIC_API_URL=https://your-project-name.up.railway.app
```

**Important:** Replace `your-project-name.up.railway.app` with your actual Railway backend URL from Step 3.

### Step 3: Deploy Frontend

**Option A: Vercel CLI (Fastest)**
```bash
cd music-monitor/frontend
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select `music-monitor` repository
4. Set **Root Directory** to `frontend`
5. Vercel will auto-detect Next.js configuration
6. Click **Deploy**

### Step 4: Update Backend CORS

After frontend is deployed, update the `FRONTEND_URL` variable in Railway:

1. Go to Railway dashboard → Your project → **Variables**
2. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will automatically redeploy with the new variable

### Step 5: Update Supabase Auth Settings

Configure Supabase to allow authentication from your production domain:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your project
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Site URL**:
   ```
   https://your-app.vercel.app
   ```
4. Add to **Redirect URLs**:
   ```
   https://your-app.vercel.app/**
   ```

### Step 6: Create Supabase Storage Bucket

The app requires a storage bucket for user avatar uploads:

1. Go to Supabase Dashboard → **Storage**
2. Click **"New bucket"**
3. Name: `user-uploads`
4. Set to **Public** bucket
5. Click **Create**

## Part 3: Verify Full Deployment

### Test Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Backend health check responds at Railway URL
- [ ] Artists display on homepage (leaderboard)
- [ ] User can sign up / log in via Supabase Auth
- [ ] User can view artist detail pages
- [ ] User can upload avatar
- [ ] User can add artists to watchlist
- [ ] User can rate and comment on artists
- [ ] API requests from frontend reach backend successfully
- [ ] No CORS errors in browser console

### Common Issues & Solutions

#### CORS Errors

**Problem:** Browser console shows CORS policy errors

**Solution:**
1. Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. Check Railway deployment logs for any errors
3. Ensure both URLs use HTTPS (not HTTP)

#### Database Connection Failed

**Problem:** API returns 500 errors, logs show "Can't reach database server"

**Solution:**
1. Verify `DATABASE_URL` is correctly set in Railway
2. Check Supabase database is active and not paused
3. Ensure connection string uses port `5432` (not `6543`)
4. Test connection string locally first

#### Avatar Upload Fails

**Problem:** File upload returns error

**Solution:**
1. Verify `user-uploads` bucket exists in Supabase Storage
2. Ensure bucket is set to **Public**
3. Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly in Railway
4. Verify file size is under 5MB limit

#### Authentication Not Working

**Problem:** Can't sign up or log in

**Solution:**
1. Check Supabase Auth settings include your Vercel URL
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches your Supabase project
3. Check browser console for detailed error messages
4. Ensure Supabase project is not paused

#### Cron Jobs Not Running

**Problem:** Data not refreshing automatically

**Solution:**
1. Manually trigger jobs to test:
   ```bash
   curl -X POST https://your-project-name.up.railway.app/api/jobs/refresh-new-releases \
     -H "secret: cronJobSecret123"
   ```
2. Check Railway logs for job execution
3. Verify `CRON_JOB_SECRET` matches in Railway variables
4. Ensure `NODE_ENV=production` is set (jobs only run in production)

## Monitoring & Maintenance

### Railway Monitoring

- **Logs:** Railway dashboard → Deployments → View logs
- **Metrics:** Railway provides CPU, memory, and network usage
- **Alerts:** Configure webhook alerts for deployment failures

### Vercel Monitoring

- **Analytics:** Vercel dashboard → Analytics
- **Logs:** Vercel dashboard → Deployments → Function logs
- **Performance:** Real User Monitoring (RUM) available

### Database Monitoring

- **Supabase Dashboard:** Monitor database size, connections, and queries
- **Connection Pooling:** Already configured in `DATABASE_URL` with `pgbouncer=true`
- **Backups:** Supabase automatically backs up your database

## Cost Estimates

### Free Tier Limits

**Railway:**
- $5 free credit per month
- After credit: ~$5-10/month for small usage
- 512MB RAM, 1GB disk space

**Vercel:**
- 100GB bandwidth/month (free)
- 100 hours serverless function execution (free)
- Typically sufficient for small projects

**Supabase:**
- 500MB database storage (free)
- 2GB bandwidth/month (free)
- 50,000 monthly active users (free)

**Total:** $0-10/month for small usage, scales with traffic

## Scaling Considerations

As your app grows:

1. **Database Connection Pooling:** Already configured via pgBouncer
2. **Railway Resources:** Upgrade to paid plan for more RAM/CPU
3. **Vercel Caching:** Configure appropriate cache headers
4. **CDN:** Vercel provides global CDN by default
5. **API Rate Limiting:** Already configured (100 req/min per IP)

## Environment Management

### Development vs Production

**Local Development:**
```bash
# backend/.env
DATABASE_URL=postgresql://...  # Local Docker or Supabase
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Production (Railway/Vercel):**
- Set via platform dashboards (Railway Variables, Vercel Environment Variables)
- Never commit production secrets to git
- Use platform secret management features

## Security Best Practices

- [x] All secrets stored in platform environment variables (not in code)
- [x] `.env` files ignored by git
- [x] CORS restricted to specific frontend domain
- [x] Rate limiting enabled (100 req/min)
- [x] HTTPS enforced by platforms
- [x] JWT secrets are strong random strings
- [x] Supabase service role key only on backend (never exposed to client)
- [x] Database connection uses pgBouncer pooling

## Rollback Procedure

### Backend Rollback (Railway)

1. Go to Railway dashboard → Deployments
2. Find previous working deployment
3. Click **"Redeploy"**
4. Railway will rollback to that version

### Frontend Rollback (Vercel)

1. Go to Vercel dashboard → Deployments
2. Find previous working deployment
3. Click **"Promote to Production"**

## Support & Troubleshooting

### Logs

**Backend Logs:**
```bash
# Railway CLI
railway logs

# Or view in Railway dashboard
```

**Frontend Logs:**
- Vercel dashboard → Deployments → Function logs

### Health Checks

**Backend:**
```bash
curl https://your-project-name.up.railway.app/health
```

**Database:**
```bash
curl https://your-project-name.up.railway.app/api/artists?limit=1
```

### Debug Mode

Temporarily increase logging:

```bash
# In Railway variables
LOG_LEVEL=debug
```

## Next Steps

After successful deployment:

1. **Custom Domain:** Configure custom domain in Vercel/Railway
2. **Analytics:** Set up Vercel Analytics or Google Analytics
3. **Error Tracking:** Integrate Sentry or similar
4. **Performance Monitoring:** Use Vercel Speed Insights
5. **SEO:** Configure meta tags and sitemap
6. **Email Notifications:** Configure Resend API for alerts
7. **Social Features:** Enable TikTok/YouTube APIs for richer data

## Useful Commands

```bash
# Test backend locally before deploying
cd backend
pnpm build
pnpm start:prod

# Test frontend locally with production API
cd frontend
NEXT_PUBLIC_API_URL=https://your-project-name.up.railway.app pnpm dev

# Trigger manual data refresh
curl -X POST https://your-project-name.up.railway.app/api/jobs/refresh-new-releases \
  -H "secret: cronJobSecret123"
```

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Deployment Guides](https://www.prisma.io/docs/guides/deployment)
- [Fastify Deployment](https://www.fastify.io/docs/latest/Guides/Deployment/)

---

**Deployment Date:** 2025-10-15
**Status:** Ready for deployment
**Backend Platform:** Railway
**Frontend Platform:** Vercel
**Database:** Supabase PostgreSQL
