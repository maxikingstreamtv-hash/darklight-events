import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isGalleryManager } from "@/lib/gallery/config";
import { GALLERY_MAX_IMAGE_BYTES, galleryUploadPath, parseGalleryUploadPayload } from "@/lib/gallery/direct-upload";

export async function POST(request: Request) {
  try {
    const actor = await getCurrentUser();
    if (!actor) return NextResponse.json({ error: "Du skal være logget ind." }, { status: 401 });
    if (!isGalleryManager(actor.role)) return NextResponse.json({ error: "Du har ikke adgang til at uploade billeder." }, { status: 403 });
    const body = await request.json() as HandleUploadBody;
    const result = await handleUpload({ request, body, onBeforeGenerateToken: async (pathname, clientPayload) => {
      const payload = parseGalleryUploadPayload(clientPayload);
      if (payload.albumId && !await prisma.galleryAlbum.findUnique({ where: { id: payload.albumId }, select: { id: true } })) throw new Error("Albummet findes ikke.");
      if (payload.eventId && !await prisma.event.findUnique({ where: { id: payload.eventId }, select: { id: true } })) throw new Error("Eventet findes ikke.");
      if (pathname !== galleryUploadPath(payload)) throw new Error("Blob-stien er ugyldig.");
      return { allowedContentTypes: [payload.contentType], maximumSizeInBytes: GALLERY_MAX_IMAGE_BYTES, addRandomSuffix: false, allowOverwrite: false };
    }});
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload kunne ikke startes." }, { status: 400 });
  }
}
