-- Restore Clerk and user-related constraints that are required by the Prisma schema
-- on databases initialized from the baseline migration only.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'clerkId'
  ) THEN
    ALTER TABLE "public"."User" ADD COLUMN "clerkId" TEXT;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "public"."User"("clerkId");
CREATE INDEX IF NOT EXISTS "User_clerkId_idx" ON "public"."User"("clerkId");

-- Deduplicate user-specific favorites before applying the uniqueness guarantee.
WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "remedyId"
      ORDER BY "createdAt" ASC, "id" ASC
    ) AS rank
  FROM "public"."Favorite"
  WHERE "userId" IS NOT NULL
)
DELETE FROM "public"."Favorite" f
USING ranked r
WHERE f."id" = r."id"
  AND r.rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_remedyId_key"
  ON "public"."Favorite"("userId", "remedyId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'SearchHistory_userId_fkey'
      AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE "public"."SearchHistory"
      ADD CONSTRAINT "SearchHistory_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Favorite_userId_fkey'
      AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE "public"."Favorite"
      ADD CONSTRAINT "Favorite_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'RemedyReview_remedyId_fkey'
      AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE "public"."RemedyReview"
      ADD CONSTRAINT "RemedyReview_remedyId_fkey"
      FOREIGN KEY ("remedyId") REFERENCES "public"."NaturalRemedy"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
