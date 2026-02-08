-- CreateTable
CREATE TABLE "DrugInteraction" (
    "id" UUID NOT NULL,
    "substanceA" TEXT NOT NULL,
    "substanceAType" TEXT NOT NULL,
    "substanceB" TEXT NOT NULL,
    "substanceBType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mechanism" TEXT,
    "recommendation" TEXT,
    "evidence" TEXT,
    "sources" TEXT[],
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "DrugInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DrugInteraction_substanceA_idx" ON "DrugInteraction"("substanceA");

-- CreateIndex
CREATE INDEX "DrugInteraction_substanceB_idx" ON "DrugInteraction"("substanceB");

-- CreateIndex
CREATE INDEX "DrugInteraction_severity_idx" ON "DrugInteraction"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "DrugInteraction_substanceA_substanceB_key" ON "DrugInteraction"("substanceA", "substanceB");
