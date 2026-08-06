export const GALLERY_BATCH_LIMIT = 20;
export const GALLERY_UPLOAD_CONCURRENCY = 3;
export const GALLERY_PAGE_SIZE = 24;
export const GALLERY_MANAGER_ROLES = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"] as const;

export function isGalleryManager(role: string) {
  return (GALLERY_MANAGER_ROLES as readonly string[]).includes(role);
}

export function galleryPage(value: string | number | undefined) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value || "1", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function galleryPageOffset(page: number) {
  return (galleryPage(page) - 1) * GALLERY_PAGE_SIZE;
}
