# Environment Variables Setup

## Overview
This project uses only TWO .env files:
- `backend/.env` - Backend configuration
- `frontend/.env.local` - Frontend configuration

## Backend Configuration (`backend/.env`)

The backend needs the following environment variables:

```bash
# Database - Supabase PostgreSQL
# Use port 5432 for session pooler (supports all operations)
DATABASE_URL=postgresql://postgres.YOUR_PROJECT:YOUR_PASSWORD@aws-0-us-east-2.pooler.supabase.com:5432/postgres

# Spotify API (from https://developer.spotify.com/dashboard)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Authentication
JWT_SECRET=your_jwt_secret_key

# Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cron Jobs
CRON_JOB_SECRET=your_cron_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
LOG_LEVEL=info

# Optional APIs
YOUTUBE_API_KEY=optional_youtube_key
APIFY_TOKEN=optional_apify_token
RESEND_API_KEY=optional_email_key
```

## Frontend Configuration (`frontend/.env.local`)

The frontend needs only these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Production Deployment

### Render (Backend)
Set these environment variables in Render dashboard:
- All variables from `backend/.env`
- Change `NODE_ENV=production`
- Change `FRONTEND_URL=https://your-frontend.vercel.app`

### Vercel (Frontend)
Set these environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`

## Important Notes

1. **One Database Everywhere**: Both local and production use the same Supabase database
2. **No Local PostgreSQL Needed**: We don't use Docker PostgreSQL anymore
3. **Ignore Other .env Files**: Only use the two files mentioned above
4. **Never Commit .env Files**: These contain secrets and should not be in Git

## Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Find:
   - `URL` → SUPABASE_URL
   - `anon public` → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role` → SUPABASE_SERVICE_ROLE_KEY
5. Go to Settings → Database
6. Find Connection String (Session pooler, port 5432) → DATABASE_URL