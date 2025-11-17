-- Add slug column to artists table (nullable for now)
ALTER TABLE "artists" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Create unique index on slug (only for non-null values)
-- This prevents the error when there are existing NULL values
CREATE UNIQUE INDEX IF NOT EXISTS "artists_slug_key" ON "artists"("slug") WHERE "slug" IS NOT NULL;

-- Create regular index for faster lookups
CREATE INDEX IF NOT EXISTS "artists_slug_idx" ON "artists"("slug");