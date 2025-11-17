-- AlterTable: Add professional/student profile fields to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "school" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "graduation_year" INTEGER;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "major" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resume_url" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "linkedin" TEXT;

-- Create index for school to help with searching students by school
CREATE INDEX IF NOT EXISTS "users_school_idx" ON "users"("school");
