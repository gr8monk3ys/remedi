-- Align enum columns with schema expectations in databases bootstrapped from
-- baseline migrations that stored these fields as TEXT.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'ContributionStatus'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "public"."ContributionStatus" AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'SubscriptionPlan'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "public"."SubscriptionPlan" AS ENUM ('free', 'basic', 'premium');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'UserRole'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "public"."UserRole" AS ENUM ('user', 'admin');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'role'
      AND udt_name = 'text'
  ) THEN
    ALTER TABLE "public"."User"
      ALTER COLUMN "role" DROP DEFAULT;

    ALTER TABLE "public"."User"
      ALTER COLUMN "role" TYPE "public"."UserRole"
      USING CASE
        WHEN "role" IN ('user', 'admin') THEN "role"::"public"."UserRole"
        ELSE 'user'::"public"."UserRole"
      END;
  END IF;
END $$;

ALTER TABLE "public"."User"
  ALTER COLUMN "role" SET DEFAULT 'user';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Subscription'
      AND column_name = 'plan'
      AND udt_name = 'text'
  ) THEN
    ALTER TABLE "public"."Subscription"
      ALTER COLUMN "plan" DROP DEFAULT;

    ALTER TABLE "public"."Subscription"
      ALTER COLUMN "plan" TYPE "public"."SubscriptionPlan"
      USING CASE
        WHEN "plan" IN ('free', 'basic', 'premium') THEN "plan"::"public"."SubscriptionPlan"
        ELSE 'free'::"public"."SubscriptionPlan"
      END;
  END IF;
END $$;

ALTER TABLE "public"."Subscription"
  ALTER COLUMN "plan" SET DEFAULT 'free';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'RemedyContribution'
      AND column_name = 'status'
      AND udt_name = 'text'
  ) THEN
    ALTER TABLE "public"."RemedyContribution"
      ALTER COLUMN "status" DROP DEFAULT;

    ALTER TABLE "public"."RemedyContribution"
      ALTER COLUMN "status" TYPE "public"."ContributionStatus"
      USING CASE
        WHEN "status" IN ('pending', 'approved', 'rejected') THEN "status"::"public"."ContributionStatus"
        ELSE 'pending'::"public"."ContributionStatus"
      END;
  END IF;
END $$;

ALTER TABLE "public"."RemedyContribution"
  ALTER COLUMN "status" SET DEFAULT 'pending';
