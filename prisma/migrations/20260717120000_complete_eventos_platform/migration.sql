ALTER TYPE "EventStatus" ADD VALUE IF NOT EXISTS 'PUBLISHED';
ALTER TYPE "EventStatus" ADD VALUE IF NOT EXISTS 'REGISTRATION_OPEN';
ALTER TYPE "EventStatus" ADD VALUE IF NOT EXISTS 'REGISTRATION_CLOSED';
ALTER TYPE "EventStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';

CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CHECKED_IN');
CREATE TYPE "HeatStatus" AS ENUM ('DRAFT', 'READY', 'ACTIVE', 'COMPLETED', 'LOCKED');
CREATE TYPE "BracketStatus" AS ENUM ('DRAFT', 'READY', 'ACTIVE', 'COMPLETED', 'LOCKED');
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'LOCKED');
CREATE TYPE "ResultStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DNF', 'DNS', 'DISQUALIFIED');
CREATE TYPE "EventTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'DISMISSED');
CREATE TYPE "EventTaskPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');
CREATE TYPE "EventAnnouncementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

ALTER TABLE "Event" ADD COLUMN "registrationOpenAt" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN "registrationCloseAt" TIMESTAMP(3);

ALTER TABLE "Participant" ADD COLUMN "userId" TEXT;
ALTER TABLE "Participant" ADD COLUMN "registrationId" TEXT;
ALTER TABLE "Participant" ADD COLUMN "seed" INTEGER;
ALTER TABLE "Participant" ADD COLUMN "checkedInAt" TIMESTAMP(3);
ALTER TABLE "Participant" ADD COLUMN "status" "RegistrationStatus" NOT NULL DEFAULT 'APPROVED';

ALTER TABLE "Result" ADD COLUMN "status" "ResultStatus" NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "Result" ADD COLUMN "finishTimeMs" INTEGER;
ALTER TABLE "Result" ADD COLUMN "reactionTimeMs" INTEGER;
ALTER TABLE "Result" ADD COLUMN "locked" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "HallOfFame" ADD COLUMN "userId" TEXT;
ALTER TABLE "HallOfFame" ADD COLUMN "description" TEXT;
ALTER TABLE "HallOfFame" ADD COLUMN "category" TEXT;
ALTER TABLE "HallOfFame" ADD COLUMN "placement" INTEGER;
ALTER TABLE "HallOfFame" ADD COLUMN "points" INTEGER;
ALTER TABLE "HallOfFame" ADD COLUMN "achievedAt" TIMESTAMP(3);
ALTER TABLE "HallOfFame" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "HallOfFame" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "HallOfFame" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "EventRegistration" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "vehicleId" TEXT,
  "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
  "competitionNumber" TEXT,
  "seed" INTEGER,
  "internalNote" TEXT,
  "checkedInAt" TIMESTAMP(3),
  "decidedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Heat" (
  "id" TEXT NOT NULL,
  "competitionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "round" INTEGER NOT NULL DEFAULT 1,
  "heatNumber" INTEGER NOT NULL,
  "status" "HeatStatus" NOT NULL DEFAULT 'DRAFT',
  "locked" BOOLEAN NOT NULL DEFAULT false,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Heat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HeatEntry" (
  "id" TEXT NOT NULL,
  "heatId" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "startPosition" INTEGER NOT NULL,
  "lane" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HeatEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Bracket" (
  "id" TEXT NOT NULL,
  "competitionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" "CompetitionType" NOT NULL,
  "size" INTEGER NOT NULL,
  "status" "BracketStatus" NOT NULL DEFAULT 'DRAFT',
  "locked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Bracket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BracketMatch" (
  "id" TEXT NOT NULL,
  "bracketId" TEXT NOT NULL,
  "round" INTEGER NOT NULL,
  "matchNumber" INTEGER NOT NULL,
  "participantAId" TEXT,
  "participantBId" TEXT,
  "winnerId" TEXT,
  "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
  "scoreA" INTEGER,
  "scoreB" INTEGER,
  "notes" TEXT,
  "scheduledAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BracketMatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventTask" (
  "id" TEXT NOT NULL,
  "eventId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "EventTaskStatus" NOT NULL DEFAULT 'OPEN',
  "priority" "EventTaskPriority" NOT NULL DEFAULT 'NORMAL',
  "entityType" TEXT,
  "entityId" TEXT,
  "assignedToId" TEXT,
  "createdById" TEXT,
  "dueAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EventTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventAnnouncement" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "authorId" TEXT,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "EventAnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EventAnnouncement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EventRegistration_eventId_userId_key" ON "EventRegistration"("eventId", "userId");
CREATE INDEX "EventRegistration_eventId_status_idx" ON "EventRegistration"("eventId", "status");
CREATE INDEX "EventRegistration_userId_status_idx" ON "EventRegistration"("userId", "status");
CREATE UNIQUE INDEX "Participant_competitionId_userId_key" ON "Participant"("competitionId", "userId");
CREATE INDEX "Participant_competitionId_seed_idx" ON "Participant"("competitionId", "seed");
CREATE UNIQUE INDEX "Result_competitionId_participantId_key" ON "Result"("competitionId", "participantId");
CREATE UNIQUE INDEX "Heat_competitionId_round_heatNumber_key" ON "Heat"("competitionId", "round", "heatNumber");
CREATE INDEX "Heat_competitionId_status_idx" ON "Heat"("competitionId", "status");
CREATE UNIQUE INDEX "HeatEntry_heatId_participantId_key" ON "HeatEntry"("heatId", "participantId");
CREATE INDEX "HeatEntry_heatId_startPosition_idx" ON "HeatEntry"("heatId", "startPosition");
CREATE INDEX "Bracket_competitionId_status_idx" ON "Bracket"("competitionId", "status");
CREATE UNIQUE INDEX "BracketMatch_bracketId_round_matchNumber_key" ON "BracketMatch"("bracketId", "round", "matchNumber");
CREATE INDEX "BracketMatch_bracketId_status_idx" ON "BracketMatch"("bracketId", "status");
CREATE INDEX "HallOfFame_active_category_year_idx" ON "HallOfFame"("active", "category", "year");
CREATE INDEX "EventTask_status_priority_idx" ON "EventTask"("status", "priority");
CREATE INDEX "EventTask_eventId_status_idx" ON "EventTask"("eventId", "status");
CREATE INDEX "EventAnnouncement_eventId_status_idx" ON "EventAnnouncement"("eventId", "status");

ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Heat" ADD CONSTRAINT "Heat_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HeatEntry" ADD CONSTRAINT "HeatEntry_heatId_fkey" FOREIGN KEY ("heatId") REFERENCES "Heat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HeatEntry" ADD CONSTRAINT "HeatEntry_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Bracket" ADD CONSTRAINT "Bracket_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "Bracket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_participantAId_fkey" FOREIGN KEY ("participantAId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_participantBId_fkey" FOREIGN KEY ("participantBId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BracketMatch" ADD CONSTRAINT "BracketMatch_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HallOfFame" ADD CONSTRAINT "HallOfFame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EventTask" ADD CONSTRAINT "EventTask_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventTask" ADD CONSTRAINT "EventTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EventTask" ADD CONSTRAINT "EventTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EventAnnouncement" ADD CONSTRAINT "EventAnnouncement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventAnnouncement" ADD CONSTRAINT "EventAnnouncement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
