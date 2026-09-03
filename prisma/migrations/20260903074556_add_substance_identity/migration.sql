-- AlterTable
ALTER TABLE "Pharmaceutical" ADD COLUMN     "genericName" TEXT,
ADD COLUMN     "rxcui" TEXT[],
ADD COLUMN     "unii" TEXT[];

-- CreateIndex
CREATE INDEX "Pharmaceutical_genericName_idx" ON "Pharmaceutical"("genericName");
