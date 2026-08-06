import { GALLERY_BATCH_LIMIT } from "./config";
import { normalizeExternalVideoUrl } from "./media";
import { validateImageFileMetadata } from "@/lib/images/image-upload";

export function validateGalleryBatch(files: Pick<File, "name" | "type" | "size">[], existingCount = 0) {
  const room = Math.max(0, GALLERY_BATCH_LIMIT - existingCount);
  return files.slice(0, room).map((file) => { try { validateImageFileMetadata(file, "gallery"); return { file, error: null }; } catch (error) { return { file, error: error instanceof Error ? error.message : "Ugyldig fil." }; } });
}

export async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(Math.max(1, limit), items.length) }, async () => { while (cursor < items.length) await worker(items[cursor++]); }));
}

export function parseVideoBatch(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => { const split = line.split("|").map((part) => part.trim()); const rawUrl = split.length > 1 ? split.at(-1)! : split[0]; return { line: index + 1, title: split.length > 1 ? split.slice(0, -1).join(" | ") : `Video ${index + 1}`, url: normalizeExternalVideoUrl(rawUrl) }; });
}

export function resolveAlbumCover(manual: string | null | undefined, images: { imageUrl: string | null; active: boolean }[], fallback = "/darklight-placeholder.svg") {
  return manual || images.find((item) => item.active && item.imageUrl)?.imageUrl || fallback;
}
