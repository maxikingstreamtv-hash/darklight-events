-- CreateEnum
CREATE TYPE "SponsorLevel" AS ENUM ('PLATINUM', 'GOLD', 'SILVER', 'PARTNER');

-- CreateEnum
CREATE TYPE "SponsorStatus" AS ENUM ('ACTIVE', 'PENDING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InboxStatus" AS ENUM ('NEW', 'READ', 'ANSWERED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "SponsorLevel" NOT NULL,
    "contactPerson" TEXT,
    "partnerSince" TIMESTAMP(3),
    "eventsSupported" TEXT[],
    "description" TEXT NOT NULL,
    "logoInitials" TEXT NOT NULL,
    "logoUrl" TEXT,
    "status" "SponsorStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "ingamePhone" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "desiredDate" TEXT NOT NULL,
    "desiredTime" TEXT NOT NULL,
    "ingameLocation" TEXT NOT NULL,
    "participants" TEXT NOT NULL,
    "ingameBudget" TEXT,
    "description" TEXT NOT NULL,
    "status" "InboxStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "ingamePhone" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "InboxStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_slug_key" ON "Sponsor"("slug");
