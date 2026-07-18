"use server";

import { prisma } from "@/lib/prisma";

export async function createBookingRequestAction(formData: FormData) {
  const characterName = String(formData.get("characterName") ?? "").trim();
  const ingamePhone = String(formData.get("ingamePhone") ?? "").trim();
  const eventType = String(formData.get("eventType") ?? "").trim();
  const desiredDate = String(formData.get("desiredDate") ?? "").trim();
  const desiredTime = String(formData.get("desiredTime") ?? "").trim();
  const ingameLocation = String(formData.get("ingameLocation") ?? "").trim();
  const participants = String(formData.get("participants") ?? "").trim();
  const ingameBudget = String(formData.get("ingameBudget") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!characterName || !ingamePhone || !eventType || !desiredDate || !desiredTime || !ingameLocation || !participants || !description) {
    return { ok: false, message: "Udfyld alle påkrævede bookingfelter." };
  }

  await prisma.bookingRequest.create({
    data: {
      characterName,
      ingamePhone,
      eventType,
      desiredDate,
      desiredTime,
      ingameLocation,
      participants,
      ingameBudget: ingameBudget || null,
      description,
    },
  });

  return { ok: true, message: "Booking modtaget. DarkLight staff følger op ingame." };
}
