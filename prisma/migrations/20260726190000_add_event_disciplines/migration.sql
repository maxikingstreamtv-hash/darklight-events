CREATE TABLE "Discipline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "usesParticipantRegistration" BOOLEAN NOT NULL DEFAULT true,
    "usesVehicles" BOOLEAN NOT NULL DEFAULT false,
    "requiresVehicleApproval" BOOLEAN NOT NULL DEFAULT false,
    "usesHeats" BOOLEAN NOT NULL DEFAULT false,
    "usesBracket" BOOLEAN NOT NULL DEFAULT false,
    "usesResults" BOOLEAN NOT NULL DEFAULT true,
    "usesPrizes" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discipline_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Event" ADD COLUMN "disciplineId" TEXT;

CREATE UNIQUE INDEX "Discipline_slug_key" ON "Discipline"("slug");
CREATE INDEX "Discipline_active_sortOrder_idx" ON "Discipline"("active", "sortOrder");
CREATE INDEX "Event_disciplineId_idx" ON "Event"("disciplineId");

ALTER TABLE "Event"
ADD CONSTRAINT "Event_disciplineId_fkey"
FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
