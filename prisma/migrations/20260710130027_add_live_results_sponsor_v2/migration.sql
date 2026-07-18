-- CreateEnum
CREATE TYPE "SponsorType" AS ENUM ('MAIN_SPONSOR', 'SPONSOR', 'PARTNER');

-- CreateEnum
CREATE TYPE "StartOrderMethod" AS ENUM ('RANDOM', 'REGISTRATION_ORDER', 'LEADERBOARD', 'MANUAL');

-- CreateEnum
CREATE TYPE "ScheduleEntryStatus" AS ENUM ('UPCOMING', 'CURRENT', 'COMPLETED', 'DNF', 'DNS', 'DQ');

-- CreateEnum
CREATE TYPE "BracketRound" AS ENUM ('QUALIFICATION', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL');

-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ctaLabel" TEXT,
ADD COLUMN     "isMainSponsor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sponsorType" "SponsorType" NOT NULL DEFAULT 'SPONSOR',
ADD COLUMN     "websiteUrl" TEXT;

-- CreateTable
CREATE TABLE "CompetitionSchedule" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "method" "StartOrderMethod" NOT NULL DEFAULT 'REGISTRATION_ORDER',
    "heatSize" INTEGER NOT NULL DEFAULT 1,
    "eventType" "CompetitionType" NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "participantId" TEXT,
    "seed" INTEGER NOT NULL,
    "startNumber" INTEGER NOT NULL,
    "heatNumber" INTEGER NOT NULL,
    "round" "BracketRound" NOT NULL DEFAULT 'QUALIFICATION',
    "bracketGroup" TEXT,
    "bracketSlot" INTEGER,
    "opponentLabel" TEXT,
    "status" "ScheduleEntryStatus" NOT NULL DEFAULT 'UPCOMING',
    "score" INTEGER,
    "timeMs" INTEGER,
    "penaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "bestTimeMs" INTEGER,
    "totalScore" INTEGER,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleEntry_scheduleId_heatNumber_sortOrder_idx" ON "ScheduleEntry"("scheduleId", "heatNumber", "sortOrder");

-- CreateIndex
CREATE INDEX "ScheduleEntry_participantId_idx" ON "ScheduleEntry"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleEntry_scheduleId_startNumber_key" ON "ScheduleEntry"("scheduleId", "startNumber");

-- AddForeignKey
ALTER TABLE "CompetitionSchedule" ADD CONSTRAINT "CompetitionSchedule_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "CompetitionSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
