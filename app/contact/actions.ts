"use server";

import { prisma } from "@/lib/prisma";

export async function createContactMessageAction(formData: FormData) {
  const characterName = String(formData.get("characterName") ?? "").trim();
  const ingamePhone = String(formData.get("ingamePhone") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!characterName || !ingamePhone || !subject || !message) {
    return { ok: false, message: "Udfyld alle kontaktfelter." };
  }

  await prisma.contactMessage.create({
    data: {
      characterName,
      ingamePhone,
      subject,
      message,
    },
  });

  return { ok: true, message: "Besked modtaget. DarkLight staff følger op ingame." };
}
