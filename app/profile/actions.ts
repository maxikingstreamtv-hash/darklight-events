"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function redirectProfile(key: "ok" | "error", message: string): never {
  redirect(`/profile?${key}=${encodeURIComponent(message)}`);
}

function cleanBio(value: string) {
  return value.replace(/[<>]/g, "").trim().slice(0, 800);
}

function validateAvatarUrl(value: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "INVALID";
  } catch {
    return "INVALID";
  }
}

export async function updateOwnProfileAction(formData: FormData) {
  const user = await requireCurrentUser();
  const bio = cleanBio(String(formData.get("bio") ?? ""));
  const avatarInput = String(formData.get("avatar") ?? "").trim();
  const avatar = validateAvatarUrl(avatarInput);

  if (avatar === "INVALID") {
    redirectProfile("error", "Avatar-URL skal starte med http:// eller https://.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bio: bio || null,
      avatar,
    },
    select: { id: true },
  });

  revalidatePath("/profile");
  revalidatePath("/profil");
  revalidatePath("/competition/drivers");
  revalidatePath(`/competition/drivers/${user.id}`);
  redirectProfile("ok", "Profil opdateret. Kun bio og avatar kan redigeres her.");
}
