CREATE TABLE "VoteCandidate" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "participantId" TEXT,
  "vehicleId" TEXT,
  "ownerUserId" TEXT,
  "ownerName" TEXT NOT NULL,
  "vehicleName" TEXT NOT NULL,
  "vehicleModel" TEXT,
  "imageUrl" TEXT NOT NULL,
  "description" TEXT,
  "startNumber" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "public" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VoteCandidate_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PublicVote" ALTER COLUMN "participantId" DROP NOT NULL;
ALTER TABLE "PublicVote" ADD COLUMN "candidateId" TEXT;

CREATE INDEX "VoteCandidate_eventId_active_public_sortOrder_idx" ON "VoteCandidate"("eventId", "active", "public", "sortOrder");
CREATE INDEX "VoteCandidate_participantId_idx" ON "VoteCandidate"("participantId");
CREATE INDEX "VoteCandidate_vehicleId_idx" ON "VoteCandidate"("vehicleId");
CREATE INDEX "VoteCandidate_ownerUserId_idx" ON "VoteCandidate"("ownerUserId");
CREATE INDEX "PublicVote_candidateId_idx" ON "PublicVote"("candidateId");

ALTER TABLE "PublicVote" DROP CONSTRAINT "PublicVote_participantId_fkey";
ALTER TABLE "PublicVote" ADD CONSTRAINT "PublicVote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PublicVote" ADD CONSTRAINT "PublicVote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "VoteCandidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VoteCandidate" ADD CONSTRAINT "VoteCandidate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VoteCandidate" ADD CONSTRAINT "VoteCandidate_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VoteCandidate" ADD CONSTRAINT "VoteCandidate_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VoteCandidate" ADD CONSTRAINT "VoteCandidate_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VoteCandidate" ADD CONSTRAINT "VoteCandidate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
