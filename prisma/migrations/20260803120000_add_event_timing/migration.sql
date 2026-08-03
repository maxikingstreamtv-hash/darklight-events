CREATE TYPE "TimingSessionStatus" AS ENUM ('READY', 'RUNNING', 'FINISHED', 'CANCELLED');
CREATE TYPE "TimingEntryStatus" AS ENUM ('READY', 'RUNNING', 'FINISHED', 'DNF', 'DNS', 'DISQUALIFIED');

CREATE TABLE "TimingSession" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "competitionId" TEXT NOT NULL,
  "status" "TimingSessionStatus" NOT NULL DEFAULT 'READY',
  "activeKey" TEXT,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "resultsTransferredAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TimingSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TimingEntry" (
  "id" TEXT NOT NULL,
  "timingSessionId" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3),
  "stoppedAt" TIMESTAMP(3),
  "elapsedMs" INTEGER,
  "status" "TimingEntryStatus" NOT NULL DEFAULT 'READY',
  "stoppedById" TEXT,
  "note" TEXT,
  "manuallyAdjusted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TimingEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TimingSession_activeKey_key" ON "TimingSession"("activeKey");
CREATE INDEX "TimingSession_eventId_createdAt_idx" ON "TimingSession"("eventId", "createdAt");
CREATE INDEX "TimingSession_competitionId_createdAt_idx" ON "TimingSession"("competitionId", "createdAt");
CREATE INDEX "TimingSession_status_idx" ON "TimingSession"("status");
CREATE UNIQUE INDEX "TimingEntry_timingSessionId_participantId_key" ON "TimingEntry"("timingSessionId", "participantId");
CREATE INDEX "TimingEntry_timingSessionId_status_idx" ON "TimingEntry"("timingSessionId", "status");
CREATE INDEX "TimingEntry_participantId_idx" ON "TimingEntry"("participantId");

ALTER TABLE "TimingSession" ADD CONSTRAINT "TimingSession_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimingSession" ADD CONSTRAINT "TimingSession_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimingSession" ADD CONSTRAINT "TimingSession_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TimingEntry" ADD CONSTRAINT "TimingEntry_timingSessionId_fkey" FOREIGN KEY ("timingSessionId") REFERENCES "TimingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimingEntry" ADD CONSTRAINT "TimingEntry_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimingEntry" ADD CONSTRAINT "TimingEntry_stoppedById_fkey" FOREIGN KEY ("stoppedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
