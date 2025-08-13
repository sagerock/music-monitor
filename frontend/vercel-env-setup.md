# Vercel Environment Variables Setup

## Required Environment Variables on Vercel

Go to your Vercel dashboard for the `music-monitor` project and set these:

### 1. Backend API URL
```
NEXT_PUBLIC_API_URL=https://music-monitor.onrender.com
```
**IMPORTANT**: This needs to point to your Render backend, not localhost!

### 2. Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://mpskjkezcifsameyfxzz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc2tqa2V6Y2lmc2FtZXlmeHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjkzMDksImV4cCI6MjA3MDYwNTMwOX0.nWMCbFyrqHv7LD4wMgLss1kA3Fcp9TRV0aDX2KhvdX8
```

### 3. Cron Job Secret (for update stats button)
```
NEXT_PUBLIC_CRON_SECRET=cronJobSecret123
```

## How to Update on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `music-monitor` project
3. Go to Settings → Environment Variables
4. Add/Update the variables above
5. **IMPORTANT**: Apply to all environments (Production, Preview, Development)
6. Click "Save"
7. Redeploy for changes to take effect:
   - Go to Deployments tab
   - Click the three dots menu on the latest deployment
   - Select "Redeploy"

## Current Issue

The frontend is currently using `http://localhost:3001` for the API URL instead of the production backend. This is why API calls are failing in production.

## After Fixing

The app should properly connect to the backend at `https://music-monitor.onrender.com` and all features should work correctly.