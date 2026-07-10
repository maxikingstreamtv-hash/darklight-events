-- AlterTable
ALTER TABLE "FaqItem" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Generelt';

-- AlterTable
ALTER TABLE "RuleSet" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Generelt',
ADD COLUMN     "description" TEXT;
