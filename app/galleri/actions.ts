"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isPermanentImageUrl } from "@/lib/images/image-upload";
import { deleteNewBlobAfterFailedSave, deleteReplacedBlobImage } from "@/lib/images/blob-cleanup";
import { normalizeExternalVideoUrl } from "@/lib/gallery/media";

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const done = (kind: "ok" | "error", message: string): never => redirect(`/galleri?${kind}=${encodeURIComponent(message)}#media-admin`);
async function requireMediaManager() { const actor = await requireCurrentUser(); if (!["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(actor.role)) redirect("/forbidden"); return actor; }

export async function saveGalleryItemAction(data: FormData) {
  const actor = await requireMediaManager();
  const id = text(data, "id"); const mediaType = text(data, "mediaType") === "VIDEO" ? "VIDEO" as const : "IMAGE" as const;
  const imageInput = text(data, "imageUrl"); const thumbnailInput = text(data, "thumbnailUrl"); const videoInput = text(data, "videoUrl");
  if (mediaType === "IMAGE" && (!imageInput || !isPermanentImageUrl(imageInput))) done("error", "Vælg et gyldigt billede.");
  const videoUrl = mediaType === "VIDEO" ? normalizeExternalVideoUrl(videoInput) : null;
  if (mediaType === "VIDEO" && !videoUrl) done("error", "Brug et gyldigt YouTube-, Vimeo-, Twitch- eller Streamable-link.");
  if (thumbnailInput && !isPermanentImageUrl(thumbnailInput)) done("error", "Thumbnail skal være et permanent billede.");
  const previous = id ? await prisma.galleryImage.findUnique({ where: { id }, select: { imageUrl: true, thumbnailUrl: true } }) : null;
  const imageUrl = mediaType === "IMAGE" ? imageInput : null; const thumbnailUrl = thumbnailInput || null;
  try {
    const payload = { title: text(data, "title") || "Uden titel", description: text(data, "description") || null, mediaType, imageUrl, videoUrl, thumbnailUrl, album: text(data, "album") || null, eventId: text(data, "eventId") || null, photographer: text(data, "photographer") || null, active: data.get("active") === "on", public: data.get("public") === "on", sortOrder: Number.parseInt(text(data, "sortOrder"), 10) || 0, createdById: actor.id };
    if (id) await prisma.galleryImage.update({ where: { id }, data: payload }); else await prisma.galleryImage.create({ data: payload });
  } catch {
    await Promise.all([deleteNewBlobAfterFailedSave(imageUrl, previous?.imageUrl), deleteNewBlobAfterFailedSave(thumbnailUrl, previous?.thumbnailUrl)]); done("error", "Mediet kunne ikke gemmes.");
  }
  await Promise.all([deleteReplacedBlobImage(previous?.imageUrl, imageUrl), deleteReplacedBlobImage(previous?.thumbnailUrl, thumbnailUrl)]);
  revalidatePath("/galleri"); done("ok", id ? "Mediet er gemt." : "Mediet er tilføjet.");
}

export async function deleteGalleryItemAction(id: string) {
  await requireMediaManager(); const item = await prisma.galleryImage.findUnique({ where: { id }, select: { imageUrl: true, thumbnailUrl: true } });
  if (!item) return done("error", "Mediet findes ikke.");
  await prisma.galleryImage.delete({ where: { id } }); await Promise.all([deleteReplacedBlobImage(item.imageUrl, null), deleteReplacedBlobImage(item.thumbnailUrl, null)]); revalidatePath("/galleri"); done("ok", "Mediet er slettet.");
}
