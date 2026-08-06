-- Add real albums while preserving every existing GalleryImage row as unassigned.
CREATE TABLE "GalleryAlbum" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "eventId" TEXT,
  "coverImageUrl" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "public" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GalleryAlbum_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "GalleryImage" ADD COLUMN "albumId" TEXT;
ALTER TABLE "GalleryImage" ADD COLUMN "uploadKey" TEXT;
CREATE UNIQUE INDEX "GalleryImage_uploadKey_key" ON "GalleryImage"("uploadKey");
CREATE INDEX "GalleryAlbum_active_public_sortOrder_idx" ON "GalleryAlbum"("active", "public", "sortOrder");
CREATE INDEX "GalleryAlbum_eventId_idx" ON "GalleryAlbum"("eventId");
CREATE INDEX "GalleryImage_albumId_active_public_sortOrder_idx" ON "GalleryImage"("albumId", "active", "public", "sortOrder");
ALTER TABLE "GalleryAlbum" ADD CONSTRAINT "GalleryAlbum_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GalleryAlbum" ADD CONSTRAINT "GalleryAlbum_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "GalleryAlbum"("id") ON DELETE SET NULL ON UPDATE CASCADE;
