ALTER TYPE "UserRole" ADD VALUE 'JUDGE';

CREATE TYPE "EventResultMethod" AS ENUM ('NONE', 'TIME_ONLY', 'POINTS_ONLY', 'TIME_AND_POINTS', 'PLACEMENT_ONLY', 'TIME_TO_POINTS', 'JUDGE_POINTS', 'JUDGE_AND_PUBLIC_VOTE', 'PUBLIC_VOTE_ONLY', 'BRACKET');
CREATE TYPE "JudgeScoreStatus" AS ENUM ('DRAFT', 'SUBMITTED');

ALTER TABLE "Event"
  ADD COLUMN "resultMethod" "EventResultMethod" NOT NULL DEFAULT 'TIME_AND_POINTS',
  ADD COLUMN "judgePointsMin" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "judgePointsMax" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN "votingOpenAt" TIMESTAMP(3),
  ADD COLUMN "votingCloseAt" TIMESTAMP(3),
  ADD COLUMN "allowVoteChange" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "judgingLockedAt" TIMESTAMP(3),
  ADD COLUMN "resultsPublishedAt" TIMESTAMP(3);

ALTER TABLE "Discipline"
  ADD COLUMN "resultMethod" "EventResultMethod" NOT NULL DEFAULT 'TIME_AND_POINTS';

CREATE TABLE "EventJudge" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "assignedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EventJudge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JudgeScore" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "competitionId" TEXT,
  "participantId" TEXT NOT NULL,
  "judgeId" TEXT NOT NULL,
  "points" INTEGER NOT NULL,
  "note" TEXT,
  "status" "JudgeScoreStatus" NOT NULL DEFAULT 'DRAFT',
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JudgeScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PublicVote" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "competitionId" TEXT,
  "participantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PublicVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EventJudge_eventId_userId_key" ON "EventJudge"("eventId", "userId");
CREATE INDEX "EventJudge_userId_active_idx" ON "EventJudge"("userId", "active");
CREATE UNIQUE INDEX "JudgeScore_eventId_participantId_judgeId_key" ON "JudgeScore"("eventId", "participantId", "judgeId");
CREATE INDEX "JudgeScore_eventId_status_idx" ON "JudgeScore"("eventId", "status");
CREATE UNIQUE INDEX "PublicVote_eventId_userId_key" ON "PublicVote"("eventId", "userId");
CREATE INDEX "PublicVote_eventId_participantId_idx" ON "PublicVote"("eventId", "participantId");

ALTER TABLE "EventJudge" ADD CONSTRAINT "EventJudge_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventJudge" ADD CONSTRAINT "EventJudge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventJudge" ADD CONSTRAINT "EventJudge_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JudgeScore" ADD CONSTRAINT "JudgeScore_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JudgeScore" ADD CONSTRAINT "JudgeScore_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JudgeScore" ADD CONSTRAINT "JudgeScore_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JudgeScore" ADD CONSTRAINT "JudgeScore_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublicVote" ADD CONSTRAINT "PublicVote_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublicVote" ADD CONSTRAINT "PublicVote_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublicVote" ADD CONSTRAINT "PublicVote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublicVote" ADD CONSTRAINT "PublicVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
