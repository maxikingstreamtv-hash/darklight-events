"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectWithMessage(key: "error" | "ok", message: string): never {
  redirect(`/register?${key}=${encodeURIComponent(message)}`);
}

async function nextDarkLightId() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { darklightId: { startsWith: "DL-" } },
        { username: { startsWith: "DL-" } },
      ],
    },
    select: { username: true, darklightId: true },
  });

  const highest = users.reduce((max, user) => {
    const value = user.darklightId ?? user.username;
    const match = /^DL-(\d+)$/.exec(value);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `DL-${String(highest + 1).padStart(5, "0")}`;
}

export async function registerUserAction(formData: FormData) {
  const username = text(formData, "username");
  const displayName = text(formData, "displayName");
  const pin = String(formData.get("pin") ?? "");

  if (username.length < 3) {
    redirectWithMessage("error", "Brugernavn skal være mindst 3 tegn.");
  }

  if (displayName.length < 2) {
    redirectWithMessage("error", "Visningsnavn skal være mindst 2 tegn.");
  }

  if (pin.length < 4) {
    redirectWithMessage("error", "DL PIN skal være mindst 4 tegn.");
  }

  const existingUsername = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: { id: true },
  });

  if (existingUsername) {
    redirectWithMessage("error", "Brugernavnet findes allerede.");
  }

  const darklightId = await nextDarkLightId();
  const existingDarkLightId = await prisma.user.findUnique({ where: { darklightId }, select: { id: true } });

  if (existingDarkLightId) {
    redirectWithMessage("error", "DarkLight ID kunne ikke genereres. Prøv igen.");
  }

  const user = await prisma.user.create({
    data: {
      username,
      darklightId,
      displayName,
      passwordHash: await hashPassword(pin),
      role: "USER",
      active: true,
      profileStatus: "ACTIVE",
      bio: "Oprettet via offentlig DarkLight registrering.",
    },
    select: {
      username: true,
      darklightId: true,
    },
  });

  redirectWithMessage(
    "ok",
    `Bruger oprettet. Brugernavn: ${user.username}. DarkLight ID: ${user.darklightId}. Fremtidigt login: brugernavn + DL PIN.`,
  );
}
