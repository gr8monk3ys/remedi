-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Pharmaceutical" (
    "id" UUID NOT NULL,
    "fdaId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "ingredients" TEXT[],
    "benefits" TEXT[],
    "usage" TEXT,
    "warnings" TEXT,
    "interactions" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Pharmaceutical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NaturalRemedy" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "ingredients" TEXT[],
    "benefits" TEXT[],
    "imageUrl" TEXT,
    "usage" TEXT,
    "dosage" TEXT,
    "precautions" TEXT,
    "scientificInfo" TEXT,
    "references" TEXT[],
    "relatedRemedies" TEXT[],
    "sourceUrl" TEXT,
    "evidenceLevel" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "NaturalRemedy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NaturalRemedyMapping" (
    "id" UUID NOT NULL,
    "pharmaceuticalId" UUID NOT NULL,
    "naturalRemedyId" UUID NOT NULL,
    "similarityScore" DOUBLE PRECISION NOT NULL,
    "matchingNutrients" TEXT[],
    "replacementType" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "NaturalRemedyMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "sessionId" TEXT,
    "userId" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" UUID NOT NULL,
    "remedyId" UUID NOT NULL,
    "remedyName" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" UUID,
    "notes" TEXT,
    "collectionName" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilterPreference" (
    "id" UUID NOT NULL,
    "sessionId" TEXT,
    "userId" UUID,
    "categories" TEXT[],
    "nutrients" TEXT[],
    "evidenceLevels" TEXT[],
    "sortBy" TEXT,
    "sortOrder" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "FilterPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMPTZ,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "bio" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "trialStartDate" TIMESTAMPTZ,
    "trialEndDate" TIMESTAMPTZ,
    "hasUsedTrial" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "RemedyReview" (
    "id" UUID NOT NULL,
    "remedyId" UUID NOT NULL,
    "remedyName" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "RemedyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemedyContribution" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ingredients" TEXT[],
    "benefits" TEXT[],
    "usage" TEXT,
    "dosage" TEXT,
    "precautions" TEXT,
    "scientificInfo" TEXT,
    "references" TEXT[],
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "moderatorNote" TEXT,
    "moderatedBy" UUID,
    "moderatedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "RemedyContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEvent" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "sessionId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "page" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "interval" TEXT,
    "stripeSubscriptionId" TEXT,
    "priceId" TEXT,
    "customerId" TEXT,
    "currentPeriodStart" TIMESTAMPTZ,
    "currentPeriodEnd" TIMESTAMPTZ,
    "startedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ,
    "cancelledAt" TIMESTAMPTZ,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailPreference" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "productUpdates" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionReminders" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "EmailPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "email" TEXT NOT NULL,
    "emailType" TEXT NOT NULL,
    "messageId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "errorMsg" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "searches" INTEGER NOT NULL DEFAULT 0,
    "aiSearches" INTEGER NOT NULL DEFAULT 0,
    "exports" INTEGER NOT NULL DEFAULT 0,
    "comparisons" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookStatus" (
    "provider" TEXT NOT NULL,
    "lastReceivedAt" TIMESTAMPTZ NOT NULL,
    "lastEventType" TEXT,
    "lastEventId" TEXT,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "WebhookStatus_pkey" PRIMARY KEY ("provider")
);

-- CreateTable
CREATE TABLE "ConversionEvent" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "sessionId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventSource" TEXT,
    "planTarget" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pharmaceutical_fdaId_key" ON "Pharmaceutical"("fdaId");

-- CreateIndex
CREATE UNIQUE INDEX "Pharmaceutical_name_key" ON "Pharmaceutical"("name");

-- CreateIndex
CREATE INDEX "Pharmaceutical_name_idx" ON "Pharmaceutical"("name");

-- CreateIndex
CREATE INDEX "Pharmaceutical_category_idx" ON "Pharmaceutical"("category");

-- CreateIndex
CREATE INDEX "Pharmaceutical_fdaId_idx" ON "Pharmaceutical"("fdaId");

-- CreateIndex
CREATE INDEX "Pharmaceutical_ingredients_idx" ON "Pharmaceutical" USING GIN ("ingredients");

-- CreateIndex
CREATE UNIQUE INDEX "NaturalRemedy_name_key" ON "NaturalRemedy"("name");

-- CreateIndex
CREATE INDEX "NaturalRemedy_name_idx" ON "NaturalRemedy"("name");

-- CreateIndex
CREATE INDEX "NaturalRemedy_category_idx" ON "NaturalRemedy"("category");

-- CreateIndex
CREATE INDEX "NaturalRemedy_evidenceLevel_idx" ON "NaturalRemedy"("evidenceLevel");

-- CreateIndex
CREATE INDEX "NaturalRemedy_ingredients_idx" ON "NaturalRemedy" USING GIN ("ingredients");

-- CreateIndex
CREATE INDEX "NaturalRemedy_benefits_idx" ON "NaturalRemedy" USING GIN ("benefits");

-- CreateIndex
CREATE INDEX "NaturalRemedyMapping_pharmaceuticalId_idx" ON "NaturalRemedyMapping"("pharmaceuticalId");

-- CreateIndex
CREATE INDEX "NaturalRemedyMapping_naturalRemedyId_idx" ON "NaturalRemedyMapping"("naturalRemedyId");

-- CreateIndex
CREATE INDEX "NaturalRemedyMapping_similarityScore_idx" ON "NaturalRemedyMapping"("similarityScore" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "NaturalRemedyMapping_pharmaceuticalId_naturalRemedyId_key" ON "NaturalRemedyMapping"("pharmaceuticalId", "naturalRemedyId");

-- CreateIndex
CREATE INDEX "SearchHistory_query_idx" ON "SearchHistory"("query");

-- CreateIndex
CREATE INDEX "SearchHistory_sessionId_idx" ON "SearchHistory"("sessionId");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");

-- CreateIndex
CREATE INDEX "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Favorite_remedyId_idx" ON "Favorite"("remedyId");

-- CreateIndex
CREATE INDEX "Favorite_sessionId_idx" ON "Favorite"("sessionId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_collectionName_idx" ON "Favorite"("collectionName");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_sessionId_remedyId_key" ON "Favorite"("sessionId", "remedyId");

-- CreateIndex
CREATE UNIQUE INDEX "FilterPreference_sessionId_key" ON "FilterPreference"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "FilterPreference_userId_key" ON "FilterPreference"("userId");

-- CreateIndex
CREATE INDEX "FilterPreference_sessionId_idx" ON "FilterPreference"("sessionId");

-- CreateIndex
CREATE INDEX "FilterPreference_userId_idx" ON "FilterPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_trialEndDate_idx" ON "User"("trialEndDate");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expires_idx" ON "Session"("expires");

-- CreateIndex
CREATE INDEX "VerificationToken_expires_idx" ON "VerificationToken"("expires");

-- CreateIndex
CREATE INDEX "RemedyReview_remedyId_idx" ON "RemedyReview"("remedyId");

-- CreateIndex
CREATE INDEX "RemedyReview_userId_idx" ON "RemedyReview"("userId");

-- CreateIndex
CREATE INDEX "RemedyReview_rating_idx" ON "RemedyReview"("rating");

-- CreateIndex
CREATE INDEX "RemedyReview_createdAt_idx" ON "RemedyReview"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "RemedyReview_helpful_idx" ON "RemedyReview"("helpful" DESC);

-- CreateIndex
CREATE INDEX "RemedyContribution_userId_idx" ON "RemedyContribution"("userId");

-- CreateIndex
CREATE INDEX "RemedyContribution_status_idx" ON "RemedyContribution"("status");

-- CreateIndex
CREATE INDEX "RemedyContribution_createdAt_idx" ON "RemedyContribution"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "RemedyContribution_category_idx" ON "RemedyContribution"("category");

-- CreateIndex
CREATE INDEX "UserEvent_userId_idx" ON "UserEvent"("userId");

-- CreateIndex
CREATE INDEX "UserEvent_sessionId_idx" ON "UserEvent"("sessionId");

-- CreateIndex
CREATE INDEX "UserEvent_eventType_idx" ON "UserEvent"("eventType");

-- CreateIndex
CREATE INDEX "UserEvent_createdAt_idx" ON "UserEvent"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserEvent_page_idx" ON "UserEvent"("page");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");

-- CreateIndex
CREATE INDEX "Subscription_expiresAt_idx" ON "Subscription"("expiresAt");

-- CreateIndex
CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");

-- CreateIndex
CREATE INDEX "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailPreference_userId_key" ON "EmailPreference"("userId");

-- CreateIndex
CREATE INDEX "EmailPreference_userId_idx" ON "EmailPreference"("userId");

-- CreateIndex
CREATE INDEX "EmailLog_userId_idx" ON "EmailLog"("userId");

-- CreateIndex
CREATE INDEX "EmailLog_email_idx" ON "EmailLog"("email");

-- CreateIndex
CREATE INDEX "EmailLog_emailType_idx" ON "EmailLog"("emailType");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "UsageRecord_userId_idx" ON "UsageRecord"("userId");

-- CreateIndex
CREATE INDEX "UsageRecord_date_idx" ON "UsageRecord"("date");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRecord_userId_date_key" ON "UsageRecord"("userId", "date");

-- CreateIndex
CREATE INDEX "ConversionEvent_userId_idx" ON "ConversionEvent"("userId");

-- CreateIndex
CREATE INDEX "ConversionEvent_sessionId_idx" ON "ConversionEvent"("sessionId");

-- CreateIndex
CREATE INDEX "ConversionEvent_eventType_idx" ON "ConversionEvent"("eventType");

-- CreateIndex
CREATE INDEX "ConversionEvent_createdAt_idx" ON "ConversionEvent"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ConversionEvent_eventSource_idx" ON "ConversionEvent"("eventSource");

-- AddForeignKey
ALTER TABLE "NaturalRemedyMapping" ADD CONSTRAINT "NaturalRemedyMapping_pharmaceuticalId_fkey" FOREIGN KEY ("pharmaceuticalId") REFERENCES "Pharmaceutical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NaturalRemedyMapping" ADD CONSTRAINT "NaturalRemedyMapping_naturalRemedyId_fkey" FOREIGN KEY ("naturalRemedyId") REFERENCES "NaturalRemedy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemedyReview" ADD CONSTRAINT "RemedyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemedyContribution" ADD CONSTRAINT "RemedyContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailPreference" ADD CONSTRAINT "EmailPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

