-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "sessionId" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "remedyId" TEXT NOT NULL,
    "remedyName" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT,
    "notes" TEXT,
    "collectionName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FilterPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "userId" TEXT,
    "categories" TEXT,
    "nutrients" TEXT,
    "evidenceLevels" TEXT,
    "sortBy" TEXT,
    "sortOrder" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "SearchHistory_query_idx" ON "SearchHistory"("query");

-- CreateIndex
CREATE INDEX "SearchHistory_sessionId_idx" ON "SearchHistory"("sessionId");

-- CreateIndex
CREATE INDEX "SearchHistory_userId_idx" ON "SearchHistory"("userId");

-- CreateIndex
CREATE INDEX "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt");

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
CREATE INDEX "FilterPreference_sessionId_idx" ON "FilterPreference"("sessionId");

-- CreateIndex
CREATE INDEX "FilterPreference_userId_idx" ON "FilterPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FilterPreference_sessionId_key" ON "FilterPreference"("sessionId");
