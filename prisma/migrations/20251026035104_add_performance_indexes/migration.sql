-- CreateIndex
CREATE INDEX "NaturalRemedy_name_idx" ON "NaturalRemedy"("name");

-- CreateIndex
CREATE INDEX "NaturalRemedy_category_idx" ON "NaturalRemedy"("category");

-- CreateIndex
CREATE INDEX "NaturalRemedy_evidenceLevel_idx" ON "NaturalRemedy"("evidenceLevel");

-- CreateIndex
CREATE INDEX "NaturalRemedyMapping_pharmaceuticalId_idx" ON "NaturalRemedyMapping"("pharmaceuticalId");

-- CreateIndex
CREATE INDEX "NaturalRemedyMapping_naturalRemedyId_idx" ON "NaturalRemedyMapping"("naturalRemedyId");

-- CreateIndex
CREATE INDEX "NaturalRemedyMapping_similarityScore_idx" ON "NaturalRemedyMapping"("similarityScore");

-- CreateIndex
CREATE INDEX "Pharmaceutical_name_idx" ON "Pharmaceutical"("name");

-- CreateIndex
CREATE INDEX "Pharmaceutical_category_idx" ON "Pharmaceutical"("category");

-- CreateIndex
CREATE INDEX "Pharmaceutical_fdaId_idx" ON "Pharmaceutical"("fdaId");
