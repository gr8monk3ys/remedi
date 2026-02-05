-- CreateTable
CREATE TABLE "Pharmaceutical" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fdaId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "usage" TEXT,
    "warnings" TEXT,
    "interactions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NaturalRemedy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "imageUrl" TEXT,
    "usage" TEXT,
    "dosage" TEXT,
    "precautions" TEXT,
    "scientificInfo" TEXT,
    "references" TEXT,
    "relatedRemedies" TEXT,
    "sourceUrl" TEXT,
    "evidenceLevel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NaturalRemedyMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pharmaceuticalId" TEXT NOT NULL,
    "naturalRemedyId" TEXT NOT NULL,
    "similarityScore" REAL NOT NULL,
    "matchingNutrients" TEXT NOT NULL,
    "replacementType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NaturalRemedyMapping_pharmaceuticalId_fkey" FOREIGN KEY ("pharmaceuticalId") REFERENCES "Pharmaceutical" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NaturalRemedyMapping_naturalRemedyId_fkey" FOREIGN KEY ("naturalRemedyId") REFERENCES "NaturalRemedy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Pharmaceutical_name_key" ON "Pharmaceutical"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NaturalRemedy_name_key" ON "NaturalRemedy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NaturalRemedyMapping_pharmaceuticalId_naturalRemedyId_key" ON "NaturalRemedyMapping"("pharmaceuticalId", "naturalRemedyId");
