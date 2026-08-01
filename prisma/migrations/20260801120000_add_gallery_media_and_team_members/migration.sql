-- Extend the existing gallery table without deleting existing images.
CREATE TYPE "GalleryMediaType" AS ENUM ('IMAGE', 'VIDEO');

ALTER TABLE "GalleryImage"
  ALTER COLUMN "imageUrl" DROP NOT NULL,
  ADD COLUMN "mediaType" "GalleryMediaType" NOT NULL DEFAULT 'IMAGE',
  ADD COLUMN "videoUrl" TEXT,
  ADD COLUMN "thumbnailUrl" TEXT,
  ADD COLUMN "album" TEXT,
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "public" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "GalleryImage"
  ADD CONSTRAINT "GalleryImage_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "GalleryImage_active_public_sortOrder_idx" ON "GalleryImage"("active", "public", "sortOrder");
CREATE INDEX "GalleryImage_eventId_idx" ON "GalleryImage"("eventId");

CREATE TABLE "TeamMember" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "roleTitle" TEXT NOT NULL,
  "secondaryTitle" TEXT,
  "quote" TEXT,
  "bio" TEXT,
  "imageUrl" TEXT,
  "skills" TEXT[],
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TeamMember_active_sortOrder_idx" ON "TeamMember"("active", "sortOrder");
