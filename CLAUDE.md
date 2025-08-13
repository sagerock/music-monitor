# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Initial Setup
```bash
./setup.sh  # Runs full setup: installs deps, starts Docker, runs migrations
```

### Daily Development
```bash
pnpm dev           # Start both frontend (3000) and backend (3001) in parallel
docker-compose up -d  # Start PostgreSQL if not running
```

### Backend-specific
```bash
cd backend
pnpm dev           # Start backend dev server (port 3001)
pnpm build         # Build TypeScript to dist/
pnpm lint          # Run ESLint
pnpm test          # Run tests with Vitest
pnpm db:push       # Push schema changes to database (dev)
pnpm db:migrate    # Create and run migrations
pnpm db:generate   # Generate Prisma client
```

### Frontend-specific
```bash
cd frontend
pnpm dev           # Start Next.js dev server (port 3000)
pnpm build         # Build production bundle
pnpm lint          # Run Next.js linting
pnpm type-check    # TypeScript type checking
```

### Data Population
```bash
# Trigger job to fetch initial artists from Spotify
curl -X POST http://localhost:3001/api/jobs/refresh-new-releases \
  -H "secret: cronJobSecret123"

# Update artist snapshots
curl -X POST http://localhost:3001/api/jobs/snapshot-artists \
  -H "secret: cronJobSecret123"
```

## Architecture Overview

### Monorepo Structure
This is a pnpm workspace monorepo with two main packages:
- `backend/` - Fastify API server with Prisma ORM
- `frontend/` - Next.js 14 app with App Router

### Backend Architecture

**Core Flow:**
1. **Spotify Integration** (`src/integrations/spotify.ts`): Client Credentials auth, manages token refresh, provides methods for fetching artists/tracks/audio features
2. **Momentum Service** (`src/services/momentum.ts`): Calculates z-score normalized momentum across artist cohorts
3. **Job System** (`src/jobs/`): Scheduled tasks for data refresh (new releases, snapshots, alerts)
4. **API Routes** (`src/api/`): RESTful endpoints organized by resource

**Key Design Decisions:**
- Environment validation with Zod in `src/config.ts` - fails fast if required env vars missing
- JWT authentication decorator pattern for protected routes
- Rate limiting and CORS configured at app level
- Prisma for type-safe database access with BigInt for large follower counts
- Cron jobs run only in production (NODE_ENV check)

### Frontend Architecture

**Component Hierarchy:**
```
app/layout.tsx (providers, global styles)
├── app/page.tsx (leaderboard with genre/time filters)
├── app/artist/[id]/page.tsx (detailed artist view)
└── components/
    ├── Data display (leaderboard-table, trends-chart, audio-profile)
    ├── Interactive (genre-selector, watchlist-button, alert-button)
    └── Visualization (sparkline, momentum-panel)
```

**State Management:**
- React Query for server state (caching, refetching)
- Local state for UI (filters, modals)
- No global client state store needed

**API Client** (`src/lib/api.ts`):
- Axios instance with auth interceptor
- Typed request/response interfaces
- Automatic token management

### Database Schema

**Core Tables:**
- `artists`: Spotify metadata, genres array, major label flag
- `snapshots`: Time-series data for momentum calculation
- `tracks`: Audio features for profile generation
- `users`: User profiles with social links, bio, avatar, and privacy settings
- `watchlists`, `alerts`: User engagement features
- `comments`, `ratings`: User-generated content for artists
- `follows`, `follow_requests`, `notifications`: Social features
- `job_logs`: Cron job monitoring

**Important Relationships:**
- One artist -> many snapshots (time series)
- One artist -> many tracks, comments, ratings
- Many-to-many: users <-> artists (via watchlists)
- Many-to-many: users <-> users (via follows with privacy controls)

### Momentum Algorithm

Located in `backend/src/services/momentum.ts`:

```typescript
// For each artist in genre cohort:
deltaPopularity = current.popularity - past.popularity
deltaFollowersPct = (current.followers - past.followers) / past.followers

// Z-score normalize across cohort
popZScore = (delta - mean) / stdDev
followersZScore = (delta - mean) / stdDev

// Weighted combination
spotifyGrowth = popZScore + 0.5 * followersZScore
momentum = 0.8 * spotifyGrowth + 0.2 * tiktokGrowth
```

### Environment Variables

**Required for backend** (`.env` or `.env.local`):
- `DATABASE_URL`: PostgreSQL connection string
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`: From Spotify dashboard
- `JWT_SECRET`: For auth tokens
- `CRON_JOB_SECRET`: Protects job endpoints
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: For authentication and file storage

**Required for frontend** (`.env.local`):
- `NEXT_PUBLIC_API_URL`: Backend API URL (http://localhost:3001)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase public API key

### Authentication Flow

**Supabase Authentication:**
1. Frontend uses Supabase Auth for sign-up/sign-in with email/password
2. Magic link authentication also supported
3. JWT tokens automatically managed by Supabase client
4. Backend validates Supabase JWT tokens via `authenticateSupabase` decorator
5. User profiles synced between Supabase and local database

## Recent Features Added

### User Profiles & Social Features
- **User Profiles**: Complete profile system with bio, social links, privacy settings
- **Avatar Upload**: Drag & drop avatar upload with Supabase Storage integration
- **Comments & Ratings**: Users can comment on and rate artists (1-5 stars)
- **Follow System**: Public/private profiles with follow requests for private accounts
- **Privacy Controls**: Users can control visibility of profile, activity, and watchlist
- **Clickable Usernames**: Navigate between user profiles from comments/ratings

### Technical Implementations
- **Supabase Integration**: Authentication, user management, and file storage
- **Privacy-Aware APIs**: Respect user privacy settings throughout the system
- **Real-time Updates**: React Query for optimistic updates and cache management
- **File Upload**: Multipart form handling with validation and error handling
- **Social Modals**: Followers/following lists with pagination

### Setup Requirements for New Features

**Supabase Storage Bucket:**
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `user-uploads`
3. Set bucket to **Public** for avatar access
4. Upload will fail without this bucket

### Deployment Notes

- Backend requires `.env` file in its directory (not parent)
- Frontend builds require `NEXT_PUBLIC_` prefix for client-side env vars
- Database migrations must run before first start
- Spotify redirect URIs use `http://127.0.0.1` (not localhost) per new requirements
- **Supabase Storage**: Create `user-uploads` bucket before avatar upload works