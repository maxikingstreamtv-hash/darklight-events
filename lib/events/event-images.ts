export const EVENT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_EVENT_IMAGE_SIZE = 8 * 1024 * 1024;

export function isBlobStorageConfigured(token: string | undefined) {
  return Boolean(token?.trim());
}

export const DEFAULT_EVENT_IMAGE_FOCUS = 50;

export function clampEventImageFocus(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_EVENT_IMAGE_FOCUS;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function eventImageObjectPosition(x = DEFAULT_EVENT_IMAGE_FOCUS, y = DEFAULT_EVENT_IMAGE_FOCUS) {
  return `${clampEventImageFocus(x)}% ${clampEventImageFocus(y)}%`;
}

export function eventImageFitClass(variant: "banner" | "card") {
  return variant === "banner" ? "object-contain" : "object-cover object-center";
}

export function validateEventImage(file: Pick<File, "type" | "size">) {
  if (!EVENT_IMAGE_TYPES.includes(file.type as (typeof EVENT_IMAGE_TYPES)[number])) {
    throw new Error("Vælg et JPG-, PNG- eller WebP-billede.");
  }
  if (file.size > MAX_EVENT_IMAGE_SIZE) {
    throw new Error("Billedet må højst fylde 8 MB.");
  }
}

export function safeEventImageName(name: string) {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "event-image";
}

export function isPermanentEventImageUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
  } catch {
    return value.startsWith("/");
  }
}

export function isVercelBlobUrl(value: string | null | undefined) {
  if (!value) return false;
  try {
    return new URL(value).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function getRenderableEventImageUrl(value: string | null | undefined) {
  return value && isPermanentEventImageUrl(value) ? value : null;
}
