"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isPermanentImageUrl } from "@/lib/images/image-upload";
import { deleteNewBlobAfterFailedSave, deleteReplacedBlobImage } from "@/lib/images/blob-cleanup";
import { normalizeExternalVideoUrl } from "@/lib/gallery/media";
import { isGalleryManager } from "@/lib/gallery/config";
import { parseVideoBatch } from "@/lib/gallery/batch";
import { albumDeletionValidation, ownedAlbumBlobUrls } from "@/lib/gallery/album-deletion";

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const done = (kind: "ok" | "error", message: string, albumId?: string | null): never => redirect(`${albumId ? `/galleri/${albumId}` : "/galleri"}?${kind}=${encodeURIComponent(message)}#media-admin`);
const galleryDone = (kind: "ok" | "error", message: string): never => redirect(`/galleri?${kind}=${encodeURIComponent(message)}`);
async function requireMediaManager() { const actor = await requireCurrentUser(); if (!isGalleryManager(actor.role)) redirect("/forbidden"); return actor; }
function refresh(albumIds: (string | null | undefined)[] = [], eventIds: (string | null | undefined)[] = []) { revalidatePath("/galleri"); revalidatePath("/galleri/uden-album"); revalidatePath("/"); for (const id of new Set(albumIds.filter(Boolean))) revalidatePath(`/galleri/${id}`); for (const id of new Set(eventIds.filter(Boolean))) revalidatePath(`/events/${id}`); }

export async function saveAlbumAction(data: FormData) {
  const actor = await requireMediaManager(); const id = text(data, "id"); const cover = text(data, "coverImageUrl") || null;
  if (!text(data, "title")) done("error", "Albummet skal have en titel.");
  if (cover && !isPermanentImageUrl(cover)) done("error", "Vælg et gyldigt coverbillede.");
  const payload = { title: text(data, "title"), description: text(data, "description") || null, eventId: text(data, "eventId") || null, coverImageUrl: cover, active: id ? data.get("active") === "on" : true, public: id ? data.get("public") === "on" : true, sortOrder: Number.parseInt(text(data, "sortOrder"), 10) || 0 };
  const previous = id ? await prisma.galleryAlbum.findUnique({ where: { id }, select: { coverImageUrl: true, eventId: true } }) : null;
  try { if (id) await prisma.galleryAlbum.update({ where: { id }, data: payload }); else await prisma.galleryAlbum.create({ data: { ...payload, createdById: actor.id } }); }
  catch { await deleteNewBlobAfterFailedSave(cover, previous?.coverImageUrl); done("error", "Albummet kunne ikke gemmes."); }
  await deleteReplacedBlobImage(previous?.coverImageUrl, cover); refresh([id], [previous?.eventId, payload.eventId]); done("ok", id ? "Albummet er gemt." : "Albummet er oprettet.");
}

export async function moveAlbumAction(id: string, direction: "up" | "down") {
  await requireMediaManager(); const albums = await prisma.galleryAlbum.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { id: true, sortOrder: true } });
  const index = albums.findIndex((album) => album.id === id); const other = albums[index + (direction === "up" ? -1 : 1)]; if (index < 0 || !other) done("error", "Albummet kan ikke flyttes længere.");
  await prisma.$transaction([prisma.galleryAlbum.update({ where: { id }, data: { sortOrder: other.sortOrder } }), prisma.galleryAlbum.update({ where: { id: other.id }, data: { sortOrder: albums[index].sortOrder } })]); refresh([id, other.id]); done("ok", "Sorteringen er opdateret.");
}

export async function deleteAlbumAction(id: string, data: FormData) {
  const actor = await getCurrentUser();
  if (!actor || !isGalleryManager(actor.role)) return galleryDone("error", "Du har ikke adgang til at slette albums.");
  const permanent = text(data, "mode") === "permanent";
  const album = await prisma.galleryAlbum.findUnique({ where: { id }, include: { items: { select: { imageUrl: true, thumbnailUrl: true } } } });
  if (!album) return galleryDone("error", "Albummet findes ikke længere.");
  const validationError = albumDeletionValidation(album.items.length, permanent, text(data, "confirmation"));
  if (validationError) return done("error", validationError, id);
  const urls = permanent ? ownedAlbumBlobUrls([...album.items, { imageUrl: album.coverImageUrl, thumbnailUrl: null }]) : [];
  try {
    await prisma.$transaction(async (tx) => {
      if (permanent) await tx.galleryImage.deleteMany({ where: { albumId: id } });
      else await tx.galleryImage.updateMany({ where: { albumId: id }, data: { albumId: null } });
      await tx.galleryAlbum.delete({ where: { id } });
    });
  } catch {
    return done("error", "Albummet kunne ikke slettes. Prøv igen.", id);
  }
  await Promise.all(urls.map((url) => deleteReplacedBlobImage(url, null)));
  refresh([id], [album.eventId]);
  if (album.items.length === 0) return galleryDone("ok", "Albummet blev slettet.");
  if (permanent) return galleryDone("ok", "Albummet og medierne blev slettet permanent.");
  return galleryDone("ok", "Albummet blev slettet. Medierne blev flyttet til Uden album.");
}

export async function createVideoBatchAction(data: FormData) {
  const actor = await requireMediaManager(); const albumId = text(data, "albumId") || null; const eventId = text(data, "eventId") || null; const description = text(data, "description") || null;
  const parsed = parseVideoBatch(text(data, "videos")); if (!parsed.length) done("error", "Indsæt mindst ét videolink.", albumId);
  const invalid = parsed.filter((item) => !item.url); if (invalid.length) done("error", `Ugyldige links på linje ${invalid.map((item) => item.line).join(", ")}. Ingen videoer blev gemt.`, albumId);
  const last = await prisma.galleryImage.aggregate({ where: { albumId }, _max: { sortOrder: true } }); const start = (last._max.sortOrder ?? -1) + 1;
  await prisma.galleryImage.createMany({ data: parsed.map((item, index) => ({ albumId, eventId, title: item.title, videoUrl: item.url!, mediaType: "VIDEO", description, active: true, public: true, sortOrder: start + index, createdById: actor.id })) }); refresh([albumId], [eventId]); done("ok", `${parsed.length} videoer er tilføjet.`, albumId);
}

export async function bulkGalleryAction(data: FormData) {
  await requireMediaManager(); const ids = data.getAll("itemId").map(String); const action = text(data, "bulkAction"); if (!ids.length) done("error", "Vælg mindst ét medie.", text(data, "currentAlbumId"));
  const current = await prisma.galleryImage.findMany({ where: { id: { in: ids } }, select: { albumId: true, eventId: true, imageUrl: true, thumbnailUrl: true } });
  if (action === "delete") { if (text(data, "confirmation") !== "SLET") done("error", "Skriv SLET for at bekræfte.", text(data, "currentAlbumId")); await prisma.galleryImage.deleteMany({ where: { id: { in: ids } } }); const urls = [...new Set(current.flatMap((item) => [item.imageUrl, item.thumbnailUrl]).filter(Boolean))]; await Promise.all(urls.map((url) => deleteReplacedBlobImage(url, null))); }
  else if (action === "activate") await prisma.galleryImage.updateMany({ where: { id: { in: ids } }, data: { active: true } });
  else if (action === "hide") await prisma.galleryImage.updateMany({ where: { id: { in: ids } }, data: { active: false } });
  else if (action === "move") await prisma.galleryImage.updateMany({ where: { id: { in: ids } }, data: { albumId: text(data, "targetAlbumId") || null } });
  else done("error", "Vælg en gyldig massehandling.", text(data, "currentAlbumId"));
  refresh([...current.map((item) => item.albumId), text(data, "targetAlbumId")], current.map((item) => item.eventId)); done("ok", `${ids.length} medier er opdateret.`, text(data, "currentAlbumId"));
}

export async function setAlbumCoverAction(albumId: string, itemId: string) { await requireMediaManager(); const item = await prisma.galleryImage.findFirst({ where: { id: itemId, albumId, mediaType: "IMAGE", imageUrl: { not: null } }, select: { imageUrl: true } }); if (!item?.imageUrl) return done("error", "Billedet kan ikke bruges som cover.", albumId); await prisma.galleryAlbum.update({ where: { id: albumId }, data: { coverImageUrl: item.imageUrl } }); refresh([albumId]); done("ok", "Coveret er opdateret.", albumId); }

export async function saveGalleryItemAction(data: FormData) {
  const actor = await requireMediaManager(); const id = text(data, "id"); const mediaType = text(data, "mediaType") === "VIDEO" ? "VIDEO" as const : "IMAGE" as const; const imageInput = text(data, "imageUrl"); const thumbnailInput = text(data, "thumbnailUrl"); const videoInput = text(data, "videoUrl");
  if (mediaType === "IMAGE" && (!imageInput || !isPermanentImageUrl(imageInput))) done("error", "Vælg et gyldigt billede."); const videoUrl = mediaType === "VIDEO" ? normalizeExternalVideoUrl(videoInput) : null; if (mediaType === "VIDEO" && !videoUrl) done("error", "Brug et gyldigt videolink."); if (thumbnailInput && !isPermanentImageUrl(thumbnailInput)) done("error", "Thumbnail skal være et permanent billede.");
  const previous = id ? await prisma.galleryImage.findUnique({ where: { id }, select: { imageUrl: true, thumbnailUrl: true, albumId: true, eventId: true } }) : null; const imageUrl = mediaType === "IMAGE" ? imageInput : null; const thumbnailUrl = thumbnailInput || null; const albumId = text(data, "albumId") || null; const eventId = text(data, "eventId") || null;
  try { const payload = { title: text(data, "title") || "Uden titel", description: text(data, "description") || null, mediaType, imageUrl, videoUrl, thumbnailUrl, albumId, eventId, photographer: text(data, "photographer") || null, active: id ? data.get("active") === "on" : true, public: id ? data.get("public") === "on" : true, sortOrder: Number.parseInt(text(data, "sortOrder"), 10) || 0, createdById: actor.id }; if (id) await prisma.galleryImage.update({ where: { id }, data: payload }); else await prisma.galleryImage.create({ data: payload }); }
  catch { await Promise.all([deleteNewBlobAfterFailedSave(imageUrl, previous?.imageUrl), deleteNewBlobAfterFailedSave(thumbnailUrl, previous?.thumbnailUrl)]); done("error", "Mediet kunne ikke gemmes.", albumId); }
  await Promise.all([deleteReplacedBlobImage(previous?.imageUrl, imageUrl), deleteReplacedBlobImage(previous?.thumbnailUrl, thumbnailUrl)]); refresh([previous?.albumId, albumId], [previous?.eventId, eventId]); done("ok", id ? "Mediet er gemt." : "Mediet er tilføjet.", albumId);
}

export async function deleteGalleryItemAction(id: string) { await requireMediaManager(); const item = await prisma.galleryImage.findUnique({ where: { id }, select: { imageUrl: true, thumbnailUrl: true, albumId: true, eventId: true } }); if (!item) return done("error", "Mediet findes ikke."); await prisma.galleryImage.delete({ where: { id } }); await Promise.all([deleteReplacedBlobImage(item.imageUrl, null), deleteReplacedBlobImage(item.thumbnailUrl, null)]); refresh([item.albumId], [item.eventId]); done("ok", "Mediet er slettet.", item.albumId); }
