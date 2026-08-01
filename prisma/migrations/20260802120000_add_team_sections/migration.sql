-- Add configurable team sections without removing or rewriting member data.
CREATE TABLE "TeamSection" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeamSection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamSection_slug_key" ON "TeamSection"("slug");
CREATE INDEX "TeamSection_isPublic_sortOrder_idx" ON "TeamSection"("isPublic", "sortOrder");

ALTER TABLE "TeamMember" ADD COLUMN "sectionId" TEXT;
CREATE INDEX "TeamMember_sectionId_sortOrder_idx" ON "TeamMember"("sectionId", "sortOrder");
ALTER TABLE "TeamMember"
  ADD CONSTRAINT "TeamMember_sectionId_fkey"
  FOREIGN KEY ("sectionId") REFERENCES "TeamSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "TeamSection" ("id", "name", "slug", "description", "sortOrder", "isPublic", "updatedAt") VALUES
  ('team-section-founders', 'Founders', 'founders', 'The people behind DarkLight Events', 1, true, CURRENT_TIMESTAMP),
  ('team-section-management', 'Management', 'management', 'Leading events and operations', 2, true, CURRENT_TIMESTAMP),
  ('team-section-staff', 'Staff', 'staff', 'Making every event possible', 3, true, CURRENT_TIMESTAMP),
  ('team-section-security', 'Security', 'security', 'Keeping every event secure', 4, true, CURRENT_TIMESTAMP);

-- Assign existing members conservatively from their current primary title.
UPDATE "TeamMember"
SET "sectionId" = CASE
  WHEN LOWER("roleTitle") LIKE '%founder%' OR LOWER("roleTitle") LIKE '%ceo%' THEN 'team-section-founders'
  WHEN LOWER("roleTitle") LIKE '%security%' OR LOWER("roleTitle") LIKE '%guard%' OR LOWER("roleTitle") LIKE '%vagt%' THEN 'team-section-security'
  WHEN LOWER("roleTitle") LIKE '%manager%' OR LOWER("roleTitle") LIKE '%management%' THEN 'team-section-management'
  ELSE 'team-section-staff'
END
WHERE "sectionId" IS NULL;
