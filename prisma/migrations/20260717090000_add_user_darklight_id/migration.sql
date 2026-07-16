ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "darklightId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_darklightId_key" ON "User"("darklightId");
