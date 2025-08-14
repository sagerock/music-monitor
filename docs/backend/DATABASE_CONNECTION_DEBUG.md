# Database Connection Debugging

## Issue:
Getting "Wrong password" error when connecting to Supabase

## Possible Causes:

### 1. Password Not Updated in Supabase
Did you update the password in Supabase Dashboard → Settings → Database?
The new password needs to be set there first.

### 2. Connection String Format
Supabase sometimes requires specific formats. Try these variations:

**Option A - Direct Connection (No Pooler):**
```
postgresql://postgres:bsHxBZ0nkCdfVqTU@db.mpskjkezcifsameyfxzz.supabase.co:5432/postgres
```

**Option B - Session Pooler with Full Username:**
```
postgresql://postgres.mpskjkezcifsameyfxzz:bsHxBZ0nkCdfVqTU@aws-0-us-east-2.pooler.supabase.com:5432/postgres
```

**Option C - Transaction Pooler (Port 6543):**
```
postgresql://postgres.mpskjkezcifsameyfxzz:bsHxBZ0nkCdfVqTU@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## To Get Correct Connection String:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Look for **Connection String** section
5. Copy the **Session mode** string
6. It should show your actual password in the string

## Test Locally First:
```bash
# Replace with actual connection string from Supabase
export DATABASE_URL="postgresql://..."
npx prisma db push --skip-generate
```

If this works locally, then use the same string on Render.

## Important Notes:
- Make sure you're copying from the right project in Supabase
- The password shown in Supabase connection string is the actual one
- Don't add quotes around the DATABASE_URL value in Render