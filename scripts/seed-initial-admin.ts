import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";

type RequiredEnvKey = "INITIAL_ADMIN_USERNAME" | "INITIAL_ADMIN_DISPLAY_NAME" | "INITIAL_ADMIN_PASSWORD";

function readRequiredEnv(key: RequiredEnvKey) {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`${key} mangler. Seed blev stoppet uden at oprette en bruger.`);
  }

  return value;
}

function normalizeUsername(username: string) {
  return username.trim();
}

async function seedInitialSuperAdmin() {
  const username = normalizeUsername(readRequiredEnv("INITIAL_ADMIN_USERNAME"));
  const displayName = readRequiredEnv("INITIAL_ADMIN_DISPLAY_NAME");
  const password = readRequiredEnv("INITIAL_ADMIN_PASSWORD");

  if (username.length < 3) {
    throw new Error("INITIAL_ADMIN_USERNAME skal være mindst 3 tegn.");
  }

  if (password.length < 8) {
    throw new Error("INITIAL_ADMIN_PASSWORD skal være mindst 8 tegn.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      displayName,
      passwordHash,
      role: "SUPER_ADMIN",
    },
    create: {
      username,
      displayName,
      passwordHash,
      role: "SUPER_ADMIN",
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
    },
  });

  console.log("DarkLight initial SUPER_ADMIN seed completed.");
  console.log(`Status: ${existingUser ? "updated existing user" : "created new user"}`);
  console.log(`Username: ${user.username}`);
  console.log(`Display name: ${user.displayName}`);
  console.log(`Role: ${user.role}`);
}

seedInitialSuperAdmin()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Ukendt seed-fejl.";
    console.error(`DarkLight initial SUPER_ADMIN seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
