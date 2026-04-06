-- Add homeOdds, drawOdds, awayOdds columns and unique constraint on matchId
-- Run this migration against your database to apply changes

-- Step 1: Remove duplicate matchId rows (keep the most recent)
DELETE FROM "Prediction"
WHERE id NOT IN (
  SELECT DISTINCT ON ("matchId") id
  FROM "Prediction"
  ORDER BY "matchId", "createdAt" DESC
);

-- Step 2: Add the three new odds columns
ALTER TABLE "Prediction"
  ADD COLUMN IF NOT EXISTS "homeOdds" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "drawOdds" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "awayOdds" DOUBLE PRECISION;

-- Step 3: Add unique constraint on matchId (safe now that dupes are removed)
ALTER TABLE "Prediction"
  ADD CONSTRAINT "Prediction_matchId_key" UNIQUE ("matchId");
