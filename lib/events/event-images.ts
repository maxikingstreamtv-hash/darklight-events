import {
  IMAGE_MIME_TYPES,
  IMAGE_SIZE_LIMITS,
  isOwnedBlobImage,
  isPermanentImageUrl,
  safeImageName,
} from "@/lib/images/image-upload";

export const EVENT_IMAGE_TYPES = IMAGE_MIME_TYPES;
export const MAX_EVENT_IMAGE_SIZE = IMAGE_SIZE_LIMITS.event;

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
  return safeImageName(name);
}

export function isPermanentEventImageUrl(value: string) {
  return isPermanentImageUrl(value);
}

export function isVercelBlobUrl(value: string | null | undefined) {
  return isOwnedBlobImage(value);
}

export function getRenderableEventImageUrl(value: string | null | undefined) {
  return value && isPermanentEventImageUrl(value) ? value : null;
}
