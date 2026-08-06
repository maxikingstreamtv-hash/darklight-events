import { IMAGE_MIME_TYPES, IMAGE_SIZE_LIMITS, safeImageName, type ImageMimeType } from "@/lib/images/image-upload";

export const GALLERY_MAX_IMAGE_BYTES = IMAGE_SIZE_LIMITS.gallery;

export type GalleryUploadPayload = {
  albumId: string | null;
  eventId: string | null;
  uploadKey: string;
  filename: string;
  contentType: ImageMimeType;
  size: number;
};

export function parseGalleryUploadPayload(value: string | null): GalleryUploadPayload {
  let input: unknown;
  try { input = JSON.parse(value || ""); } catch { throw new Error("Uploadoplysningerne er ugyldige."); }
  if (!input || typeof input !== "object") throw new Error("Uploadoplysningerne er ugyldige.");
  const data = input as Record<string, unknown>;
  const uploadKey = String(data.uploadKey ?? "").trim();
  const filename = String(data.filename ?? "").trim();
  const contentType = String(data.contentType ?? "") as ImageMimeType;
  const size = Number(data.size);
  const albumId = String(data.albumId ?? "").trim() || null;
  const eventId = String(data.eventId ?? "").trim() || null;
  if (!uploadKey || uploadKey.length > 160 || !filename || !Number.isSafeInteger(size) || size <= 0) throw new Error("Uploadoplysningerne er ugyldige.");
  if (!IMAGE_MIME_TYPES.includes(contentType)) throw new Error("Filen er ikke et gyldigt JPG-, PNG- eller WebP-billede.");
  if (size > GALLERY_MAX_IMAGE_BYTES) throw new Error("Billedet må maksimalt fylde 8 MB.");
  return { albumId, eventId, uploadKey, filename, contentType, size };
}

export function galleryUploadPath(payload: GalleryUploadPayload) {
  const owner = payload.albumId || "unassigned";
  const unique = payload.uploadKey.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!unique) throw new Error("Uploadnøglen er ugyldig.");
  return `gallery/${owner}/${unique}-${safeImageName(payload.filename)}`;
}

export function isExpectedGalleryBlob(urlValue: string, pathname: string) {
  try {
    const url = new URL(urlValue);
    return url.protocol === "https:" && url.hostname.endsWith(".blob.vercel-storage.com") && decodeURIComponent(url.pathname.slice(1)) === pathname;
  } catch { return false; }
}

export function hasValidImageSignature(contentType: string, bytes: Uint8Array) {
  const jpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.length >= 8 && [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((v,i)=>bytes[i]===v);
  const webp = bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0,4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8,12)) === "WEBP";
  return contentType === "image/jpeg" ? jpeg : contentType === "image/png" ? png : contentType === "image/webp" ? webp : false;
}

export async function parseApiResponse(response: Response): Promise<{ error?: string; [key: string]: unknown }> {
  const type = response.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    try { return await response.json(); } catch { return { error: "Uploadtjenesten svarede ikke. Prøver igen." }; }
  }
  const text = await response.text().catch(() => "");
  return { error: text ? "Uploadtjenesten afviste forespørgslen." : "Uploadtjenesten svarede ikke. Prøver igen." };
}

export function isRetryableUploadStatus(status: number) { return [429, 502, 503, 504].includes(status); }
