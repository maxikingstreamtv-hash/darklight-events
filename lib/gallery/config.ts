export const GALLERY_BATCH_LIMIT = 20;
export const GALLERY_UPLOAD_CONCURRENCY = 3;
export const GALLERY_MANAGER_ROLES = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"] as const;

export function isGalleryManager(role: string) {
  return (GALLERY_MANAGER_ROLES as readonly string[]).includes(role);
}
