# Transaction Pooling Setup (Optional)

This guide explains how to set up transaction pooling for read-heavy queries to double your effective connection limit on Supabase.

## Why Transaction Pooling?

Supabase offers two pooling modes:
- **Session Mode** (default): Each client gets a dedicated connection for the session. Good for writes and transactions.
- **Transaction Mode**: Connections are shared between clients. Perfect for read-only queries.

By using both modes, you can effectively double your connection capacity.

## Setup Instructions

### 1. Get Your Transaction Mode URL

1. Go to Supabase Dashboard → Settings → Database
2. Find "Connection String" section
3. Copy the **Transaction** pooler URL (not Session)
4. It will look like: `postgresql://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### 2. Add to Environment Variables

In your `.env` file, add:

```bash
# Existing session pooler (for writes)
DATABASE_URL=postgresql://...pooler.supabase.com:5432/postgres

# New transaction pooler (for reads)
DATABASE_URL_TRANSACTION=postgresql://...pooler.supabase.com:6543/postgres
```

Note the different ports:
- Session: port `5432`
- Transaction: port `6543`

### 3. Create a Read-Only Prisma Client

Create a new file `src/db/read-client.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForReadPrisma = global as unknown as { readPrisma: PrismaClient };

// Read-only client using transaction pooling
export const readPrisma =
  globalForReadPrisma.readPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL_TRANSACTION || process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForReadPrisma.readPrisma = readPrisma;
}
```

### 4. Update Your Code

For read-only queries, use `readPrisma`:

```typescript
import { readPrisma } from '../db/read-client';

// Use for SELECT queries
const artists = await readPrisma.artist.findMany();
const count = await readPrisma.artist.count();
```

For writes, continue using regular `prisma`:

```typescript
import { prisma } from '../db/client';

// Use for INSERT, UPDATE, DELETE
await prisma.artist.create({ data: {...} });
await prisma.artist.update({ where: {...}, data: {...} });
```

### 5. Which Queries to Move

Good candidates for transaction pooling (read-only):
- Leaderboard queries
- Artist listings
- Search queries
- Count queries
- Any `findMany`, `findFirst`, `findUnique` without writes

Keep on session pooling (writes/transactions):
- User authentication
- Creating/updating records
- Transactions (`$transaction`)
- Any writes or complex operations

## Monitoring

After implementing, monitor the `/api/health` endpoint to ensure both pools are healthy:

```bash
curl https://your-backend.com/api/health
```

## Rollback

If you encounter issues, simply remove `DATABASE_URL_TRANSACTION` from your environment and all queries will fall back to the session pooler.

## Benefits

- ✅ Double your connection capacity
- ✅ Better performance for read-heavy workloads
- ✅ Separate read/write concerns
- ✅ Easy rollback if needed

## Notes

- Transaction pooling doesn't support prepared statements
- Some Prisma features like `$queryRaw` with parameters may need adjustment
- Monitor both connection pools in production