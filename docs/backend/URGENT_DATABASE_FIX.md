# URGENT: Fix DATABASE_URL on Render

## The Error:
```
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`
```

## The Issue:
The password special character encoding might be causing issues. The `*` in your password needs proper handling.

## Solution Options:

### Option 1: Use Properly Encoded Password
```
DATABASE_URL=postgresql://postgres.mpskjkezcifsameyfxzz:wzf5ayw5PWZ2pkb%2Akzd@aws-0-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=10
```

### Option 2: Get a New Database Password (Recommended)
1. Go to Supabase Dashboard
2. Settings → Database
3. Reset database password (choose one WITHOUT special characters)
4. Update DATABASE_URL with new password

### Option 3: Use Connection String from Supabase
1. Go to Supabase Dashboard → Settings → Database
2. Find "Connection string" section
3. Copy the "Session mode" connection string (port 5432)
4. Add these parameters to the end: `?pgbouncer=true&connection_limit=10`

## Quick Test:
Make sure your DATABASE_URL starts exactly with `postgresql://` (no quotes, no extra characters)

## On Render:
1. Go to Environment Variables
2. Make sure DATABASE_URL value:
   - Has NO quotes around it
   - Starts with postgresql://
   - Has no leading/trailing spaces

## Test After Fix:
```bash
curl https://music-monitor.onrender.com/api/leaderboard
```

Should return actual data, not an error.