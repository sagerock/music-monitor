-- Add alert_type column to alerts table
ALTER TABLE "alerts" 
ADD COLUMN IF NOT EXISTS "alert_type" TEXT DEFAULT 'momentum';

-- Make threshold nullable since it's only for momentum alerts
ALTER TABLE "alerts" 
ALTER COLUMN "threshold" DROP NOT NULL;

-- Add unique constraint for one alert per type per artist per user
ALTER TABLE "alerts"
DROP CONSTRAINT IF EXISTS "alerts_user_artist_type_unique";

ALTER TABLE "alerts"
ADD CONSTRAINT "alerts_user_artist_type_unique" 
UNIQUE ("user_id", "artist_id", "alert_type");

-- Add index for faster lookups by artist and type
CREATE INDEX IF NOT EXISTS "alerts_artist_type_idx" 
ON "alerts" ("artist_id", "alert_type");

-- Update existing alerts to have 'momentum' type
UPDATE "alerts" 
SET "alert_type" = 'momentum' 
WHERE "alert_type" IS NULL;