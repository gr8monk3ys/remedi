-- Add missing subscription feature tables that are present in schema.prisma
-- but absent from some deployed databases.

-- CreateTable
CREATE TABLE IF NOT EXISTS "HealthProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "categories" TEXT[],
    "goals" TEXT[],
    "allergies" TEXT[],
    "conditions" TEXT[],
    "dietaryPrefs" TEXT[],
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "HealthProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MedicationCabinet" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "startDate" DATE,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "MedicationCabinet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "RemedyJournal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "remedyId" UUID NOT NULL,
    "remedyName" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "rating" INTEGER NOT NULL,
    "symptoms" TEXT[],
    "sideEffects" TEXT[],
    "dosageTaken" TEXT,
    "notes" TEXT,
    "mood" INTEGER,
    "energyLevel" INTEGER,
    "sleepQuality" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "RemedyJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "RemedyReport" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "queryType" TEXT NOT NULL,
    "queryInput" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generating',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "RemedyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "HealthProfile_userId_key" ON "HealthProfile"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HealthProfile_userId_idx" ON "HealthProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MedicationCabinet_userId_name_key" ON "MedicationCabinet"("userId", "name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MedicationCabinet_userId_idx" ON "MedicationCabinet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RemedyJournal_userId_remedyId_date_key" ON "RemedyJournal"("userId", "remedyId", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RemedyJournal_userId_remedyId_idx" ON "RemedyJournal"("userId", "remedyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RemedyJournal_date_idx" ON "RemedyJournal"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RemedyReport_userId_idx" ON "RemedyReport"("userId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'HealthProfile_userId_fkey') THEN
        ALTER TABLE "HealthProfile" ADD CONSTRAINT "HealthProfile_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MedicationCabinet_userId_fkey') THEN
        ALTER TABLE "MedicationCabinet" ADD CONSTRAINT "MedicationCabinet_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RemedyJournal_userId_fkey') THEN
        ALTER TABLE "RemedyJournal" ADD CONSTRAINT "RemedyJournal_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RemedyReport_userId_fkey') THEN
        ALTER TABLE "RemedyReport" ADD CONSTRAINT "RemedyReport_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
