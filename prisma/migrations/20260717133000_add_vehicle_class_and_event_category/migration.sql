-- Add separate free-text field for intended event use.
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "eventCategory" TEXT;
