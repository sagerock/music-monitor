-- Safe migration to add slug column if it doesn't exist
DO $$ 
BEGIN
    -- Check if slug column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='artists' 
        AND column_name='slug'
    ) THEN
        -- Add slug column
        ALTER TABLE "artists" ADD COLUMN "slug" TEXT;
        
        -- Create unique index
        CREATE UNIQUE INDEX "artists_slug_key" ON "artists"("slug");
        
        -- Create regular index for faster lookups  
        CREATE INDEX "artists_slug_idx" ON "artists"("slug");
        
        RAISE NOTICE 'Slug column added successfully';
    ELSE
        RAISE NOTICE 'Slug column already exists';
    END IF;
END $$;