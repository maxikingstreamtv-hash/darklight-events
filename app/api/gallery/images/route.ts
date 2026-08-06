import { head } from "@vercel/blob";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isGalleryManager } from "@/lib/gallery/config";
import { deleteNewBlobAfterFailedSave } from "@/lib/images/blob-cleanup";
import { galleryUploadPath, hasValidImageSignature, isExpectedGalleryBlob, parseGalleryUploadPayload } from "@/lib/gallery/direct-upload";

export async function POST(request: Request) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ error: "Du skal være logget ind." }, { status: 401 });
  if (!isGalleryManager(actor.role)) return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });
  let blobUrl: string | null = null;
  async function rejectUploadedBlob(error: string) {
    await deleteNewBlobAfterFailedSave(blobUrl, null);
    blobUrl = null;
    return NextResponse.json({ error }, { status: 400 });
  }
  try {
    const input = await request.json() as Record<string, unknown>;
    const payload = parseGalleryUploadPayload(JSON.stringify(input));
    const existing = await prisma.galleryImage.findUnique({ where: { uploadKey: payload.uploadKey } });
    if (existing) return NextResponse.json({ item: existing, duplicate: true });
    if (payload.albumId && !await prisma.galleryAlbum.findUnique({ where: { id: payload.albumId }, select: { id: true } })) return NextResponse.json({ error: "Albummet findes ikke." }, { status: 400 });
    blobUrl = String(input.blobUrl ?? "");
    const pathname = galleryUploadPath(payload);
    if (!isExpectedGalleryBlob(blobUrl, pathname)) return rejectUploadedBlob("Blob-uploaden er ugyldig.");
    const metadata = await head(blobUrl);
    if (metadata.pathname !== pathname || metadata.size !== payload.size || metadata.size > 8 * 1024 * 1024 || metadata.contentType !== payload.contentType) return rejectUploadedBlob("Blob-metadata matcher ikke billedet.");
    const signatureResponse = await fetch(blobUrl, { headers: { Range: "bytes=0-11" }, cache: "no-store" });
    if (!signatureResponse.ok || !hasValidImageSignature(payload.contentType, new Uint8Array(await signatureResponse.arrayBuffer()))) return rejectUploadedBlob("Filen er ikke et gyldigt JPG-, PNG- eller WebP-billede.");
    const prefix = String(input.titlePrefix ?? "").trim();
    const title = prefix ? `${prefix} ${payload.filename.replace(/\.[^.]+$/, "")}` : payload.filename.replace(/\.[^.]+$/, "");
    const item = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`gallery:${payload.albumId || "unassigned"}`}))`;
      const duplicate = await tx.galleryImage.findUnique({ where: { uploadKey: payload.uploadKey } });
      if (duplicate) return duplicate;
      const last = await tx.galleryImage.aggregate({ where: { albumId: payload.albumId }, _max: { sortOrder: true } });
      return tx.galleryImage.create({ data: { albumId: payload.albumId, eventId: payload.eventId, mediaType: "IMAGE", imageUrl: blobUrl!, title, description: String(input.description ?? "").trim() || null, active: true, public: true, sortOrder: (last._max.sortOrder ?? -1) + 1, createdById: actor.id, uploadKey: payload.uploadKey } });
    });
    revalidatePath("/galleri"); if (payload.albumId) revalidatePath(`/galleri/${payload.albumId}`); if (payload.eventId) revalidatePath(`/events/${payload.eventId}`); revalidatePath("/");
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    await deleteNewBlobAfterFailedSave(blobUrl, null);
    return NextResponse.json({ error: "Billedet blev uploadet, men kunne ikke gemmes. Uploaden er ryddet op.", detail: error instanceof Error ? error.name : "UploadError" }, { status: 400 });
  }
}
