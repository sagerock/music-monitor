# Music Monitor - AI-Powered A&R Scouting Assistant

Surface fast-rising artists in selected genres using Spotify audio/metadata and social signals, helping A&R professionals spot who to listen to now.

## Features

### Core Analytics
- **Real-time Momentum Tracking**: Calculate artist momentum using popularity, follower growth, and social signals
- **Genre-based Filtering**: Focus on specific genres to find relevant rising artists
- **Comprehensive Artist Profiles**: View detailed analytics including audio features, trends, and recent tracks
- **Watchlist & Alerts**: Track favorite artists and get notified when momentum exceeds thresholds
- **Daily Data Refresh**: Automated jobs keep artist data current

### Social & Community Features
- **User Profiles**: Complete profile system with bio, social links, and customizable privacy settings
- **Avatar Upload**: Drag & drop profile picture upload with automatic resizing and validation
- **Comments & Ratings**: Rate artists (1-5 stars) and leave detailed comments for community discussion
- **Follow System**: Follow other users with support for public/private profiles and follow requests
- **Privacy Controls**: Granular privacy settings for profile visibility, activity, and watchlist sharing
- **Social Discovery**: Click usernames to explore other users' profiles and musical tastes

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Recharts, React Query
- **Backend**: Fastify, TypeScript, Prisma ORM, Multipart file handling
- **Database**: PostgreSQL with comprehensive social schema
- **APIs**: Spotify Web API (Client Credentials)
- **Authentication**: Supabase Auth with JWT validation
- **File Storage**: Supabase Storage for avatar uploads
- **Deployment**: Vercel (frontend), Railway/Render (backend), Supabase (database + auth + storage)

## Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (for local PostgreSQL)
- Spotify Developer Account
- Supabase Account (for authentication and file storage)

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd music-monitor
pnpm install
```

### 2. Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Get your Client ID and Client Secret
4. Add them to `.env.local`

### 3. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to **Settings** → **API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key
3. Go to **Storage** and create a new bucket:
   - Name: `user-uploads`
   - Set to **Public** (for avatar access)
4. Add all keys to `.env.local`

### 4. Environment Variables

Copy `.env.example` to `.env.local` and update:

```bash
cp .env.example .env.local
```

**Backend variables** (`backend/.env`):
- `SPOTIFY_CLIENT_ID` - Your Spotify app client ID
- `SPOTIFY_CLIENT_SECRET` - Your Spotify app client secret
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

**Frontend variables** (`frontend/.env.local`):
- `NEXT_PUBLIC_API_URL=http://localhost:3001` - Backend API URL
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL  
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public anon key

### 5. Database Setup

Start PostgreSQL with Docker:

```bash
docker-compose up -d
```

Run migrations:

```bash
cd backend
pnpm db:migrate
```

### 6. Start Development Servers

In the root directory:

```bash
pnpm dev
```

This starts:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

## Project Structure

```
music-monitor/
├── backend/
│   ├── src/
│   │   ├── api/          # API route handlers
│   │   ├── services/     # Business logic (momentum calculation)
│   │   ├── integrations/ # Spotify API client
│   │   ├── jobs/         # Cron jobs for data refresh
│   │   └── db/           # Database client and migrations
│   └── prisma/
│       └── schema.prisma # Database schema
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # API client and utilities
│   │   └── styles/       # Global styles
│   └── public/
└── docker-compose.yml    # Local PostgreSQL setup
```

## API Endpoints

### Public Endpoints
- `GET /api/leaderboard` - Get momentum-ranked artists
- `GET /api/artists/:id` - Get artist details
- `GET /api/artists/genres/list` - Get available genres

### Protected Endpoints (require JWT)
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add artist to watchlist
- `DELETE /api/watchlist/:artistId` - Remove from watchlist
- `GET /api/alerts` - Get user's alerts
- `POST /api/alerts` - Create momentum alert
- `DELETE /api/alerts/:id` - Delete alert

### Admin Endpoints (require CRON_JOB_SECRET)
- `POST /api/jobs/refresh-new-releases` - Pull new Spotify releases
- `POST /api/jobs/snapshot-artists` - Update artist snapshots
- `POST /api/jobs/check-alerts` - Check and send alert emails

## Momentum Algorithm

```typescript
spotify_growth = zscore(Δ popularity) + 0.5 * zscore(Δ followers_pct)
tiktok_growth = zscore(Δ tiktok_mentions_pct)
momentum_score = 0.8 * spotify_growth + 0.2 * tiktok_growth
```

- Δ popularity = change in Spotify popularity score
- Δ followers_pct = percentage change in followers
- Z-score normalization ensures comparability across genres

## Deployment

This application is designed to be deployed using **Vercel** (frontend) and **Railway** (backend + database).

### Quick Deploy

**📋 Prerequisites:**
- Railway and Vercel accounts
- GitHub repository  
- Spotify API credentials
- Supabase project (auth + storage)

**🚀 Deploy Steps:**

1. **Backend (Railway):**
   ```bash
   # Connect GitHub repo to Railway
   # Add PostgreSQL service
   # Configure environment variables from railway.env.example
   ```

2. **Frontend (Vercel):**
   ```bash
   # Connect GitHub repo to Vercel
   # Set root directory to 'frontend'
   # Add environment variables for API_URL and Supabase
   ```

3. **Complete Setup:**
   - Update Supabase auth redirect URLs
   - Test all functionality end-to-end

**📚 Detailed Guide:** See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete step-by-step instructions

**✅ Checklist:** Use [DEPLOYMENT-CHECKLIST.md](./docs/DEPLOYMENT-CHECKLIST.md) to ensure nothing is missed

**💰 Estimated Cost:** $5-30/month depending on usage

## Scheduled Jobs

Configure these cron jobs in production:

- `07:00 UTC` - Refresh new releases
- `07:10 UTC` - Snapshot artist data
- `07:30 UTC` - Check alerts and send notifications

## Testing

Run backend tests:
```bash
cd backend
pnpm test
```

Run frontend tests:
```bash
cd frontend
pnpm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT

## Roadmap

- [ ] TikTok API integration (currently stubbed)
- [ ] Playlist momentum tracking
- [ ] Territory/region breakouts
- [ ] Similarity search
- [ ] Producer/writer collaboration graph
- [ ] Label affiliation detection