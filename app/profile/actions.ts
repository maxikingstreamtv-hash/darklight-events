"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { deleteNewBlobAfterFailedSave, deleteReplacedBlobImage } from "@/lib/images/blob-cleanup";
import { isPermanentImageUrl } from "@/lib/images/image-upload";

function redirectProfile(key: "ok" | "error", message: string): never {
  redirect(`/profile?${key}=${encodeURIComponent(message)}`);
}

function cleanBio(value: string) {
  return value.replace(/[<>]/g, "").trim().slice(0, 800);
}

export async function updateOwnProfileAction(formData: FormData) {
  const user = await requireCurrentUser();
  const bio = cleanBio(String(formData.get("bio") ?? ""));
  const avatarInput = String(formData.get("avatar") ?? "").trim();
  const avatar = avatarInput || null;

  if (!isPermanentImageUrl(avatar)) {
    redirectProfile("error", "Profilbilledet skal være uploadet permanent.");
  }

  const previous = await prisma.user.findUnique({ where: { id: user.id }, select: { avatar: true } });
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        bio: bio || null,
        avatar,
      },
      select: { id: true },
    });
  } catch {
    await deleteNewBlobAfterFailedSave(avatar, previous?.avatar);
    redirectProfile("error", "Profilen kunne ikke gemmes. Det nye billede er ryddet op.");
  }
  await deleteReplacedBlobImage(previous?.avatar, avatar);

  revalidatePath("/profile");
  revalidatePath("/profil");
  revalidatePath("/competition/drivers");
  revalidatePath(`/competition/drivers/${user.id}`);
  redirectProfile("ok", "Profil og profilbillede er opdateret.");
}
