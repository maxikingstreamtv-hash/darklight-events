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
    where: { username: { startsWith: "DL-" } },
    select: { username: true },
  });

  const highest = users.reduce((max, user) => {
    const match = /^DL-(\d+)$/.exec(user.username);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `DL-${String(highest + 1).padStart(5, "0")}`;
}

export async function registerUserAction(formData: FormData) {
  const displayName = text(formData, "displayName");
  const pin = String(formData.get("pin") ?? "");

  if (displayName.length < 2) {
    redirectWithMessage("error", "Character navn skal være mindst 2 tegn.");
  }

  if (pin.length < 4) {
    redirectWithMessage("error", "DL PIN skal være mindst 4 tegn.");
  }

  const username = await nextDarkLightId();
  const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });

  if (existing) {
    redirectWithMessage("error", "DarkLight ID kunne ikke genereres. Prøv igen.");
  }

  const user = await prisma.user.create({
    data: {
      username,
      displayName,
      passwordHash: await hashPassword(pin),
      role: "USER",
      active: true,
      profileStatus: "ACTIVE",
      bio: "Oprettet via offentlig DarkLight registrering.",
    },
    select: {
      username: true,
    },
  });

  redirectWithMessage("ok", `Bruger oprettet. Dit DarkLight ID er ${user.username}.`);
}
