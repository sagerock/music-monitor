# Render Environment Configuration Checklist

## Required Environment Variables on Render

Please verify these environment variables are set in your Render dashboard:

### 1. Database Configuration
```
DATABASE_URL=postgresql://postgres.mpskjkezcifsameyfxzz:wzf5ayw5PWZ2pkb%2Akzd@aws-0-us-east-2.pooler.supabase.com:5432/postgres?connect_timeout=30&pool_timeout=30
```
**IMPORTANT**: 
- Use port `5432` for the session pooler
- The `*` in password is URL encoded as `%2A`
- Added `connect_timeout=30` and `pool_timeout=30` to handle connection issues
- Since you upgraded Supabase, no connection_limit is needed

### 2. Spotify API
```
SPOTIFY_CLIENT_ID=9284da7cf454497ab5982f11970071f0
SPOTIFY_CLIENT_SECRET=75f695f020654f539af63f404bfc949d
```

### 3. Authentication & Security
```
JWT_SECRET=supersecretjwtkey123456789
CRON_JOB_SECRET=cronJobSecret123
```

### 4. Supabase Configuration
```
SUPABASE_URL=https://mpskjkezcifsameyfxzz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc2tqa2V6Y2lmc2FtZXlmeHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyOTMwOSwiZXhwIjoyMDcwNjA1MzA5fQ.iQ92Ju4O-Ht6XEhfQdToor5_ftA-JEsGAMWZabOT-NQ
```

### 5. Frontend URL (for CORS)
```
FRONTEND_URL=https://music-monitor.vercel.app
```

### 6. Node Environment
```
NODE_ENV=production
LOG_LEVEL=info
```

### 7. Optional APIs
```
YOUTUBE_API_KEY=AIzaSyAQZMVKaCQlbGEUtajAoSm1a4gzqlOOvu0
```

## Current Issues

1. **500 Errors on `/api/socials/artist/` and `/api/ratings/artist/`**
   - Likely cause: Database connection issue or missing environment variables
   - Check: DATABASE_URL is correctly set with port 5432

2. **401 Error on `/api/jobs/update-social-stats`**
   - Cause: CRON_JOB_SECRET mismatch
   - Frontend sends: `cronJobSecret123`
   - Backend needs: Same value in CRON_JOB_SECRET env var

## How to Fix

1. Go to your Render dashboard
2. Select your `music-monitor` service
3. Go to Environment tab
4. Add/Update all the variables listed above
5. Click "Save Changes"
6. The service will automatically redeploy

## Test Commands

After fixing, test with:

```bash
# Test database connection
curl https://music-monitor.onrender.com/api/leaderboard

# Test social stats update (should return success)
curl -X POST https://music-monitor.onrender.com/api/jobs/update-social-stats \
  -H "Content-Type: application/json" \
  -H "secret: cronJobSecret123"

# Test artist socials endpoint
curl https://music-monitor.onrender.com/api/socials/artist/06HL4z0CvFAxyc27GXpf02
```