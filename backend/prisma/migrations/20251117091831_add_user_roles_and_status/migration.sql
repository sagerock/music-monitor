-- CreateEnum for UserRole
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateEnum for UserStatus
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- AlterTable - Add role and status fields to users table
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';
ALTER TABLE "users" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "users" ADD COLUMN "status_reason" TEXT;
ALTER TABLE "users" ADD COLUMN "status_changed_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "status_changed_by" TEXT;

-- Create index on role for faster admin queries
CREATE INDEX "users_role_idx" ON "users"("role");

-- Create index on status for filtering suspended/banned users
CREATE INDEX "users_status_idx" ON "users"("status");
