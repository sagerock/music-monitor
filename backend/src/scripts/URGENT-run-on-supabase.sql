-- URGENT: Run this on Supabase SQL Editor to fix alert creation
-- This adds the new alert_type field that the code is expecting

-- 1. Add alert_type column if it doesn't exist
ALTER TABLE "alerts" 
ADD COLUMN IF NOT EXISTS "alert_type" TEXT DEFAULT 'momentum';

-- 2. Make threshold nullable (since comment/rating alerts don't need it)
ALTER TABLE "alerts" 
ALTER COLUMN "threshold" DROP NOT NULL;

-- 3. Update any existing alerts to have the default type
UPDATE "alerts" 
SET "alert_type" = 'momentum' 
WHERE "alert_type" IS NULL;

-- 4. Drop existing constraint if it exists (to recreate it)
ALTER TABLE "alerts"
DROP CONSTRAINT IF EXISTS "alerts_user_artist_type_unique";

-- 5. Add unique constraint for one alert per type per artist per user
ALTER TABLE "alerts"
ADD CONSTRAINT "alerts_user_artist_type_unique" 
UNIQUE ("user_id", "artist_id", "alert_type");

-- 6. Add index for faster lookups
CREATE INDEX IF NOT EXISTS "alerts_artist_type_idx" 
ON "alerts" ("artist_id", "alert_type");

-- 7. Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'alerts'
ORDER BY ordinal_position;