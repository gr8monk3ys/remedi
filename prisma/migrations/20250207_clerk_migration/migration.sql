-- Clerk Migration: Add clerkId to User, remove NextAuth models
-- This migration transitions from NextAuth.js to Clerk authentication

-- Step 1: Add clerkId column to User table (only if User table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'clerkId') THEN
            ALTER TABLE "User" ADD COLUMN "clerkId" TEXT;
        END IF;
    END IF;
END $$;

-- Step 2: Create unique index on clerkId (if User table and column exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'clerkId') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_clerkId_key') THEN
            CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
        END IF;
    END IF;
END $$;

-- Step 3: Create index on clerkId for fast lookups
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'clerkId') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_clerkId_idx') THEN
            CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");
        END IF;
    END IF;
END $$;

-- Step 4: Drop NextAuth-managed tables (Clerk manages these externally)
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
