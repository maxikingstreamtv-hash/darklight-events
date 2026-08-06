import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isGalleryManager } from "@/lib/gallery/config";
import { imageBlobPath, validateImageFile } from "@/lib/images/image-upload";
import { deleteNewBlobAfterFailedSave } from "@/lib/images/blob-cleanup";
import { isBlobStorageConfigured } from "@/lib/events/event-images";

export async function POST(request: Request) {
  const actor = await getCurrentUser();
  if (!actor) return NextResponse.json({ error: "Du skal være logget ind." }, { status: 401 });
  if (!isGalleryManager(actor.role)) return NextResponse.json({ error: "Ingen adgang." }, { status: 403 });
  if (!isBlobStorageConfigured(process.env.BLOB_READ_WRITE_TOKEN)) return NextResponse.json({ error: "Billedlager er ikke konfigureret." }, { status: 503 });
  let blobUrl: string | null = null;
  try {
    const data = await request.formData();
    const file = data.get("file");
    const albumId = String(data.get("albumId") ?? "").trim() || null;
    const eventId = String(data.get("eventId") ?? "").trim() || null;
    const uploadKey = String(data.get("uploadKey") ?? "").trim();
    if (!(file instanceof File)) return NextResponse.json({ error: "Vælg et billede." }, { status: 400 });
    if (!uploadKey || uploadKey.length > 160) return NextResponse.json({ error: "Uploadnøgle mangler." }, { status: 400 });
    const existing = await prisma.galleryImage.findUnique({ where: { uploadKey } });
    if (existing) return NextResponse.json({ item: existing, duplicate: true });
    if (albumId && !await prisma.galleryAlbum.findUnique({ where: { id: albumId }, select: { id: true } })) return NextResponse.json({ error: "Albummet findes ikke." }, { status: 400 });
    await validateImageFile(file, "gallery");
    const path = imageBlobPath("gallery", albumId || "unassigned", file.name, randomUUID());
    blobUrl = (await put(path, file, { access: "public", addRandomSuffix: false })).url;
    const prefix = String(data.get("titlePrefix") ?? "").trim();
    const title = prefix ? `${prefix} ${file.name.replace(/\.[^.]+$/, "")}` : file.name.replace(/\.[^.]+$/, "");
    const item = await prisma.$transaction(async (tx) => {
      // Serialize order allocation per album while keeping the slower Blob uploads concurrent.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`gallery:${albumId || "unassigned"}`}))`;
      const last = await tx.galleryImage.aggregate({ where: { albumId }, _max: { sortOrder: true } });
      return tx.galleryImage.create({ data: { albumId, eventId, mediaType: "IMAGE", imageUrl: blobUrl, title, description: String(data.get("description") ?? "").trim() || null, active: true, public: true, sortOrder: (last._max.sortOrder ?? -1) + 1, createdById: actor.id, uploadKey } });
    });
    revalidatePath("/galleri"); if (albumId) revalidatePath(`/galleri/${albumId}`); if (eventId) revalidatePath(`/events/${eventId}`); revalidatePath("/");
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    await deleteNewBlobAfterFailedSave(blobUrl, null);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload fejlede." }, { status: 400 });
  }
}
