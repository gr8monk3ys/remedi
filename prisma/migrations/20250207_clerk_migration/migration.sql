-- Clerk Migration: Add clerkId to User, remove NextAuth models
-- This migration transitions from NextAuth.js to Clerk authentication

-- Step 1: Add clerkId column to User table
ALTER TABLE "User" ADD COLUMN "clerkId" TEXT;

-- Step 2: Create unique index on clerkId
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- Step 3: Create index on clerkId for fast lookups
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- Step 4: Drop NextAuth-managed tables (Clerk manages these externally)
-- Drop foreign key constraints first
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
