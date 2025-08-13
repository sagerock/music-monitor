# Music Monitor Deployment Guide

This guide walks you through deploying the Music Monitor application online using Vercel (frontend) and Railway (backend + database).

## Overview

**Architecture:**
- **Frontend**: Next.js 14 deployed on Vercel
- **Backend**: Fastify API deployed on Railway  
- **Database**: PostgreSQL hosted on Railway
- **Authentication & Storage**: Supabase (already configured)

**Estimated Monthly Cost:** $5-30/month depending on usage

## Prerequisites

- GitHub account
- Railway account ([railway.app](https://railway.app))
- Vercel account ([vercel.com](https://vercel.com))
- Supabase account (already set up)
- Spotify Developer credentials

## Step-by-Step Deployment

### Phase 1: Backend Deployment (Railway)

#### 1.1 Create Railway Project

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select your music-monitor repository
5. Railway will detect the services automatically

#### 1.2 Set up PostgreSQL Database

1. In your Railway project, click "New Service"  
2. Select "Database" → "PostgreSQL"
3. Railway will provision a PostgreSQL instance
4. Note the connection details (available in Variables tab)

#### 1.3 Configure Backend Service

1. In Railway dashboard, click on the backend service
2. Go to "Settings" → "Environment Variables"
3. Add all variables from `railway.env.example`:

```env
# Database (auto-provided by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Required Variables
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
SPOTIFY_CLIENT_ID=your-spotify-client-id  
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
FRONTEND_URL=https://your-app-name.vercel.app
CRON_JOB_SECRET=your-secure-cron-job-secret
LOG_LEVEL=info
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

4. Go to "Settings" → "Networking" and generate a domain
5. Note your backend URL (e.g., `https://your-app.railway.app`)

#### 1.4 Deploy and Initialize Database

1. Railway will automatically build and deploy from your Dockerfile
2. Once deployed, run database migrations:
   - Go to Railway dashboard → your backend service
   - Click "Deployments" → latest deployment → "View Logs"
   - Migrations should run automatically via the `start:prod` script

### Phase 2: Frontend Deployment (Vercel)

#### 2.1 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"  
3. Import your music-monitor repository from GitHub
4. Vercel will detect Next.js automatically
5. Configure the following settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build` (auto-detected)

#### 2.2 Configure Environment Variables

In Vercel dashboard → Project Settings → Environment Variables, add:

```env
NEXT_PUBLIC_API_URL=https://your-backend-app.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 2.3 Update Backend CORS

Update your Railway backend environment variables:
- Set `FRONTEND_URL` to your Vercel domain (e.g., `https://music-monitor.vercel.app`)

### Phase 3: Configure Supabase for Production

#### 3.1 Update Auth Settings

1. In Supabase Dashboard → Authentication → URL Configuration:
   - **Site URL**: `https://your-app.vercel.app`  
   - **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

#### 3.2 Verify Storage Bucket

1. Go to Storage in Supabase dashboard
2. Ensure `user-uploads` bucket exists and is set to **Public**
3. If missing, create it now

### Phase 4: Final Configuration & Testing

#### 4.1 Test the Deployment

1. Visit your Vercel frontend URL
2. Test user registration/login  
3. Test artist search and watchlist
4. Test profile features and avatar upload
5. Check backend health: `https://your-backend.railway.app/health`

#### 4.2 Set up Monitoring

**Railway:**
- Monitor logs in Railway dashboard
- Set up alerts for service health

**Vercel:**
- Check function logs in Vercel dashboard  
- Monitor performance metrics

## Environment Variables Reference

### Backend (Railway)
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=3001
JWT_SECRET=your-jwt-secret
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
FRONTEND_URL=https://your-app.vercel.app
CRON_JOB_SECRET=your-cron-secret
LOG_LEVEL=info
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co  
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Scheduled Jobs Setup

The backend includes cron jobs for data refresh. In production:

1. Jobs run automatically when `NODE_ENV=production`
2. Default schedule (UTC):
   - `07:00` - Refresh new releases
   - `07:10` - Snapshot artist data  
   - `07:30` - Check alerts

To trigger jobs manually:
```bash
curl -X POST https://your-backend.railway.app/api/jobs/refresh-new-releases \
  -H "secret: your-cron-job-secret"
```

## Troubleshooting

### Common Issues

**Backend not starting:**
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure DATABASE_URL is properly configured

**CORS errors:**
- Verify FRONTEND_URL matches your Vercel domain
- Check CORS configuration in backend

**Database connection issues:**
- Ensure Railway PostgreSQL service is running
- Check DATABASE_URL format
- Run migrations if needed

**Supabase auth issues:**
- Verify redirect URLs in Supabase settings
- Check SUPABASE_URL and keys are correct
- Ensure storage bucket exists and is public

### Logs & Debugging

**Railway Backend Logs:**
```bash
# View in Railway dashboard or CLI
railway logs
```

**Vercel Function Logs:**
- Available in Vercel dashboard under Functions tab

**Health Checks:**
- Backend: `https://your-backend.railway.app/health`
- Frontend: Should load normally

## Scaling & Performance

**Railway:**
- Automatically scales based on load
- Monitor metrics in dashboard
- Upgrade plan if needed

**Vercel:**  
- Edge caching and CDN included
- Monitor Core Web Vitals
- Upgrade for higher limits

## Cost Optimization

**Railway:**
- Free tier: $5/month credit
- Pro plan: $20/month for higher limits
- PostgreSQL: Included in usage

**Vercel:**
- Free tier: 100GB bandwidth, 6k build minutes
- Pro plan: $20/month if exceeded

**Supabase:**
- Free tier: 50MB database, 1GB bandwidth
- Pro plan: $25/month for production apps

## Maintenance

### Regular Tasks
- Monitor error logs weekly
- Update dependencies monthly  
- Backup database (automatic on Railway)
- Review performance metrics

### Updates
1. Push changes to GitHub
2. Railway and Vercel auto-deploy
3. Test functionality
4. Monitor for errors

## Support

If you encounter issues:
1. Check Railway and Vercel documentation
2. Review logs for specific error messages
3. Verify all environment variables are correct
4. Test locally first if possible