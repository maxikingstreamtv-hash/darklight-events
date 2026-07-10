import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

const adminDarkLightId = "DL-00001";
const adminEmail = "admin@darklight.dk";
const adminDisplayName = "Cole Kane";
const adminPassword = "Admin123!";

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

async function seed() {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { username: adminDarkLightId },
        { username: adminEmail },
      ],
    },
    select: {
      id: true,
    },
  });

  if (existingSuperAdmin) {
    console.log("Super Admin already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const user = await prisma.user.create({
    data: {
      username: adminDarkLightId,
      displayName: adminDisplayName,
      passwordHash,
      role: "SUPER_ADMIN",
      bio: `Seeded initial Super Admin. Email reference: ${adminEmail}`,
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

  console.log("Super Admin created");
  console.log(`Username: ${user.username}`);
  console.log(`Display name: ${user.displayName}`);
  console.log(`Role: ${user.role}`);
  console.log(`Badges attached: ${seededBadges.length}`);
  console.log(`Permissions attached: ${seededPermissions.length}`);
}

seed()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Ukendt seed-fejl";
    console.error(`Seed failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
