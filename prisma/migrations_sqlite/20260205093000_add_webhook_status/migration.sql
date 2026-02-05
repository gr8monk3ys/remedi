-- CreateTable
CREATE TABLE "WebhookStatus" (
    "provider" TEXT NOT NULL,
    "lastReceivedAt" TIMESTAMPTZ NOT NULL,
    "lastEventType" TEXT,
    "lastEventId" TEXT,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "WebhookStatus_pkey" PRIMARY KEY ("provider")
);
