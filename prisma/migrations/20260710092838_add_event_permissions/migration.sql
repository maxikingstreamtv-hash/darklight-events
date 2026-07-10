-- CreateEnum
CREATE TYPE "EventPermissionStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "EventPermission" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "EventPermissionStatus" NOT NULL DEFAULT 'PENDING',
    "authority" TEXT NOT NULL,
    "applicant" TEXT NOT NULL,
    "date" TEXT,
    "comment" TEXT NOT NULL,
    "documentRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventPermission_slug_key" ON "EventPermission"("slug");
