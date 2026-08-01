export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number];
export type ImageUploadScope = "event" | "profile" | "sponsor" | "vehicle" | "gallery" | "team";

export const IMAGE_EXTENSIONS: Record<ImageMimeType, readonly string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export const IMAGE_SIZE_LIMITS: Record<ImageUploadScope, number> = {
  event: 8 * 1024 * 1024,
  profile: 5 * 1024 * 1024,
  sponsor: 8 * 1024 * 1024,
  vehicle: 8 * 1024 * 1024,
  gallery: 8 * 1024 * 1024,
  team: 5 * 1024 * 1024,
};

export function imageSizeLabel(scope: ImageUploadScope) {
  return `${IMAGE_SIZE_LIMITS[scope] / 1024 / 1024} MB`;
}

export function safeImageName(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "image";
}

export function validateImageFileMetadata(
  file: Pick<File, "name" | "type" | "size">,
  scope: ImageUploadScope,
) {
  if (file.size <= 0) {
    throw new Error("Billedfilen er tom.");
  }
  if (!IMAGE_MIME_TYPES.includes(file.type as ImageMimeType)) {
    throw new Error("Vælg et JPG-, PNG- eller WebP-billede.");
  }
  const extension = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";
  if (!IMAGE_EXTENSIONS[file.type as ImageMimeType].includes(extension)) {
    throw new Error("Filtypen passer ikke til billedets filendelse.");
  }
  if (file.size > IMAGE_SIZE_LIMITS[scope]) {
    throw new Error(`Billedet må højst fylde ${imageSizeLabel(scope)}.`);
  }
}

export async function validateImageFile(
  file: Pick<File, "name" | "type" | "size" | "arrayBuffer">,
  scope: ImageUploadScope,
) {
  validateImageFileMetadata(file, scope);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const jpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png =
    bytes.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  const webp =
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  const valid =
    (file.type === "image/jpeg" && jpeg) ||
    (file.type === "image/png" && png) ||
    (file.type === "image/webp" && webp);
  if (!valid) {
    throw new Error("Filen indeholder ikke et gyldigt billede.");
  }
}

export function isPermanentImageUrl(value: string | null | undefined) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
  } catch {
    return value.startsWith("/");
  }
}

export function isOwnedBlobImage(value: string | null | undefined) {
  if (!value) return false;
  try {
    return new URL(value).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function imageBlobPath(scope: ImageUploadScope, ownerId: string, filename: string, uniqueId: string) {
  const folder = scope === "profile" ? "profiles" : scope === "gallery" ? "gallery" : scope === "team" ? "team" : `${scope}s`;
  const safeOwner = ownerId.replace(/[^a-zA-Z0-9_-]/g, "") || "draft";
  return `${folder}/${safeOwner}/${uniqueId}-${safeImageName(filename)}`;
}
