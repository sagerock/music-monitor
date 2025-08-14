# Database Connection Pool Fix for Render

## The Problem
Even with sequential queries, we're getting connection pool timeouts on Render.
The error shows: "connection limit: 17" which is very low.

## The Solution
Update your DATABASE_URL on Render with proper pgBouncer configuration for Supabase Pro.

### Current URL (causing issues):
```
DATABASE_URL=postgresql://postgres.mpskjkezcifsameyfxzz:wzf5ayw5PWZ2pkb%2Akzd@aws-0-us-east-2.pooler.supabase.com:5432/postgres?connect_timeout=30&pool_timeout=30
```

### Updated URL (with proper pool settings):
```
DATABASE_URL=postgresql://postgres.mpskjkezcifsameyfxzz:wzf5ayw5PWZ2pkb%2Akzd@aws-0-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=10&pool_timeout=30
```

## What changed:
1. Added `pgbouncer=true` - Tells Prisma to use pgBouncer mode
2. Changed to `connection_limit=10` - Limits connections per instance (Render may have multiple)
3. Kept `pool_timeout=30` - 30 second timeout for getting connections

## Alternative: Use Transaction Pooler (Port 6543)
If the above doesn't work, try using the transaction pooler instead:
```
DATABASE_URL=postgresql://postgres.mpskjkezcifsameyfxzz:wzf5ayw5PWZ2pkb%2Akzd@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10
```

## How to Apply:
1. Go to Render Dashboard
2. Select your music-monitor service
3. Go to Environment tab
4. Update DATABASE_URL with one of the above
5. Save Changes (will trigger redeploy)

## To Test After Deploy:
```bash
curl https://music-monitor.onrender.com/api/leaderboard
```

Should return data, not a connection pool error.