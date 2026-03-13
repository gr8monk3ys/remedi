-- Add full-text search index on Pharmaceutical name and description
CREATE INDEX IF NOT EXISTS "Pharmaceutical_fulltext_idx" ON "Pharmaceutical" USING GIN (
  to_tsvector('english', coalesce("name", '') || ' ' || coalesce("description", ''))
);

-- Add full-text search index on NaturalRemedy name and description
CREATE INDEX IF NOT EXISTS "NaturalRemedy_fulltext_idx" ON "NaturalRemedy" USING GIN (
  to_tsvector('english', coalesce("name", '') || ' ' || coalesce("description", ''))
);
