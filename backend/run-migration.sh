#!/bin/bash
# Run migrations using direct connection (port 5432)
export DATABASE_URL="postgresql://postgres.mpskjkezcifsameyfxzz:bsHxBZ0nkCdfVqTU@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
pnpm prisma migrate deploy
