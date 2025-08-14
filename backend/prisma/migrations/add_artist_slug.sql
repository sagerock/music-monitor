-- Add slug column to artists table
ALTER TABLE "artists" ADD COLUMN "slug" TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX "artists_slug_key" ON "artists"("slug");

-- Create regular index for faster lookups
CREATE INDEX "artists_slug_idx" ON "artists"("slug");