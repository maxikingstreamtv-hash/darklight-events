import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";

type RequiredEnvKey = "INITIAL_ADMIN_USERNAME" | "INITIAL_ADMIN_DISPLAY_NAME" | "INITIAL_ADMIN_PASSWORD";

const badges = [
  { name: "founder", label: "Founder", description: "DarkLight grundlægger", icon: "crown", color: "silver" },
  { name: "sponsor", label: "Sponsor", description: "Sponsor-status i DarkLight RP-universet", icon: "badge", color: "silver" },
  { name: "staff", label: "Staff", description: "DarkLight staff-status", icon: "shield", color: "white" },
  { name: "vip", label: "VIP", description: "VIP-status", icon: "star", color: "silver" },
  { name: "event-winner", label: "Event Winner", description: "Vinder af et DarkLight event", icon: "trophy", color: "gold" },
  { name: "hall-of-fame", label: "Hall of Fame", description: "Optaget i DarkLight Hall of Fame", icon: "sparkles", color: "silver" },
  { name: "photographer", label: "Photographer", description: "Fotografstatus i DarkLight events", icon: "camera", color: "silver" },
  { name: "host", label: "Host", description: "Event host-status", icon: "mic", color: "white" },
] as const;

const permissions = [
  { key: "MANAGE_USERS", label: "Administrer brugere", description: "Kan administrere brugere" },
  { key: "MANAGE_BADGES", label: "Administrer badges", description: "Kan administrere badges" },
  { key: "MANAGE_PERMISSIONS", label: "Administrer permissions", description: "Kan administrere permissions" },
  { key: "MANAGE_EVENTS", label: "Administrer events", description: "Kan administrere events" },
  { key: "MANAGE_RESULTS", label: "Administrer resultater", description: "Kan administrere resultater" },
  { key: "MANAGE_GALLERY", label: "Administrer galleri", description: "Kan administrere galleri" },
  { key: "MANAGE_SETTINGS", label: "Administrer settings", description: "Kan administrere settings" },
] as const;

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

  const seededBadges = await Promise.all(
    badges.map((badge: (typeof badges)[number]) =>
      prisma.badge.upsert({
        where: { name: badge.name },
        update: {
          label: badge.label,
          description: badge.description,
          icon: badge.icon,
          color: badge.color,
        },
        create: badge,
        select: { id: true, name: true },
      }),
    ),
  );

  const seededPermissions = await Promise.all(
    permissions.map((permission: (typeof permissions)[number]) =>
      prisma.permission.upsert({
        where: { key: permission.key },
        update: {
          label: permission.label,
          description: permission.description,
        },
        create: permission,
        select: { id: true, key: true },
      }),
    ),
  );

  await Promise.all(
    seededBadges.map((badge: { id: string; name: string }) =>
      prisma.userBadge.upsert({
        where: {
          userId_badgeId: {
            userId: user.id,
            badgeId: badge.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          badgeId: badge.id,
          grantedBy: user.id,
        },
      }),
    ),
  );

  await Promise.all(
    seededPermissions.map((permission: { id: string; key: string }) =>
      prisma.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: user.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          permissionId: permission.id,
          grantedBy: user.id,
        },
      }),
    ),
  );

  console.log("DarkLight initial SUPER_ADMIN seed completed.");
  console.log(`Status: ${existingUser ? "updated existing user" : "created new user"}`);
  console.log(`Username: ${user.username}`);
  console.log(`Display name: ${user.displayName}`);
  console.log(`Role: ${user.role}`);
  console.log(`Badges attached: ${seededBadges.length}`);
  console.log(`Permissions attached: ${seededPermissions.length}`);
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
