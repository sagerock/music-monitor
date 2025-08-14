# Update DATABASE_URL on Render

## New DATABASE_URL (copy exactly):
```
postgresql://postgres.mpskjkezcifsameyfxzz:bsHxBZ0nkCdfVqTU@aws-0-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=10&pool_timeout=30
```

## Steps:
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `music-monitor` service
3. Go to **Environment** tab
4. Find `DATABASE_URL`
5. Replace with the above value (NO quotes)
6. Click **Save Changes**
7. Service will auto-redeploy

## What this fixes:
- ✅ No special character encoding issues
- ✅ Proper pgBouncer configuration
- ✅ Connection pool limits to prevent exhaustion
- ✅ 30 second timeout for connections

## After Deploy Completes:
Test all endpoints are working:

```bash
# Test database connection
curl https://music-monitor.onrender.com/api/leaderboard

# Test ratings endpoint (was failing before)
curl https://music-monitor.onrender.com/api/ratings/artist/06HL4z0CvFAxyc27GXpf02

# Test social stats update
curl -X POST https://music-monitor.onrender.com/api/jobs/update-social-stats \
  -H "secret: cronJobSecret123"
```

All should return data without connection pool errors!