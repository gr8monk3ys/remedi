-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "interval" TEXT,
    "stripeSubscriptionId" TEXT,
    "priceId" TEXT,
    "customerId" TEXT,
    "currentPeriodStart" DATETIME,
    "currentPeriodEnd" DATETIME,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("cancelledAt", "createdAt", "customerId", "expiresAt", "id", "interval", "plan", "priceId", "startedAt", "status", "updatedAt", "userId") SELECT "cancelledAt", "createdAt", "customerId", "expiresAt", "id", "interval", "plan", "priceId", "startedAt", "status", "updatedAt", "userId" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");
CREATE INDEX "Subscription_expiresAt_idx" ON "Subscription"("expiresAt");
CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");
CREATE INDEX "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
