-- Make a Remedy Mapping's Replacement Type mandatory.
--
-- A null label rendered as no badge at all -- the least cautious presentation
-- available, produced by exactly the paths with the least governance. Rows
-- that never got a label are backfilled to "Supportive", the weakest claim
-- this vocabulary can make, so an unlabelled legacy row degrades safely rather
-- than blocking the migration or asserting more than we know.
UPDATE "NaturalRemedyMapping"
SET "replacementType" = 'Supportive'
WHERE "replacementType" IS NULL;

-- Anything outside the three-value union is legacy data under another name.
-- Same reasoning, same direction.
UPDATE "NaturalRemedyMapping"
SET "replacementType" = 'Supportive'
WHERE "replacementType" NOT IN ('Alternative', 'Complementary', 'Supportive');

ALTER TABLE "NaturalRemedyMapping" ALTER COLUMN "replacementType" SET NOT NULL;
