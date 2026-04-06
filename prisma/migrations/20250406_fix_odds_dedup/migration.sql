-- ============================================================
-- Migration: Fix duplicate predictions + add split odds fields
-- Run this ONCE against your existing database before deploying
-- ============================================================

-- Step 1: Remove duplicate matchId rows (keep the most recently created one)
DELETE FROM "Prediction"
WHERE id NOT IN (
  SELECT DISTINCT ON ("matchId") id
  FROM "Prediction"
  ORDER BY "matchId", "createdAt" DESC
);

-- Step 2: Add the three split odds columns (idempotent)
ALTER TABLE "Prediction"
  ADD COLUMN IF NOT EXISTS "homeOdds" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "drawOdds" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "awayOdds" DOUBLE PRECISION;

-- Step 3: Add unique constraint on matchId (safe now duplicates are gone)
ALTER TABLE "Prediction"
  ADD CONSTRAINT IF NOT EXISTS "Prediction_matchId_key" UNIQUE ("matchId");
