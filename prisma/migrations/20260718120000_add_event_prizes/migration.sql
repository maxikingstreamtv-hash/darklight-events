-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('CASH', 'VEHICLE', 'TROPHY', 'SPONSOR', 'VIP', 'ITEM', 'SPECIAL', 'OTHER');

-- CreateTable
CREATE TABLE "EventPrize" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prizeType" "PrizeType" NOT NULL,
    "placement" INTEGER,
    "amount" DECIMAL(65,30),
    "currency" TEXT,
    "itemName" TEXT,
    "sponsorName" TEXT,
    "awardLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPrize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPrizeWinner" (
    "id" TEXT NOT NULL,
    "eventPrizeId" TEXT NOT NULL,
    "participantId" TEXT,
    "userId" TEXT,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "EventPrizeWinner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventPrize_eventId_active_sortOrder_idx" ON "EventPrize"("eventId", "active", "sortOrder");

-- CreateIndex
CREATE INDEX "EventPrize_eventId_placement_idx" ON "EventPrize"("eventId", "placement");

-- CreateIndex
CREATE UNIQUE INDEX "EventPrizeWinner_eventPrizeId_participantId_key" ON "EventPrizeWinner"("eventPrizeId", "participantId");

-- CreateIndex
CREATE UNIQUE INDEX "EventPrizeWinner_eventPrizeId_userId_key" ON "EventPrizeWinner"("eventPrizeId", "userId");

-- CreateIndex
CREATE INDEX "EventPrizeWinner_participantId_idx" ON "EventPrizeWinner"("participantId");

-- CreateIndex
CREATE INDEX "EventPrizeWinner_userId_idx" ON "EventPrizeWinner"("userId");

-- AddForeignKey
ALTER TABLE "EventPrize" ADD CONSTRAINT "EventPrize_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPrizeWinner" ADD CONSTRAINT "EventPrizeWinner_eventPrizeId_fkey" FOREIGN KEY ("eventPrizeId") REFERENCES "EventPrize"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPrizeWinner" ADD CONSTRAINT "EventPrizeWinner_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPrizeWinner" ADD CONSTRAINT "EventPrizeWinner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
