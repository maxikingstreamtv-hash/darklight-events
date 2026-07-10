import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL mangler. Prisma kræver en PostgreSQL connection string.");
}

const adapter = new PrismaPg(connectionString);

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function hasCurrentDelegates(client: PrismaClient) {
  const delegates = client as PrismaClient & {
    faqItem?: unknown;
    ruleSet?: unknown;
  };

  return Boolean(delegates.faqItem && delegates.ruleSet);
}

export const prisma =
  globalForPrisma.prisma && hasCurrentDelegates(globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
