import { isOwnedBlobImage } from "@/lib/images/image-upload";

export function albumDeletionValidation(itemCount: number, permanent: boolean, confirmation: string) {
  if (itemCount > 0 && permanent && confirmation.trim() !== "SLET PERMANENT") {
    return "Skriv SLET PERMANENT for at bekræfte permanent sletning.";
  }
  return null;
}

export function ownedAlbumBlobUrls(items: { imageUrl: string | null; thumbnailUrl: string | null }[]) {
  return [...new Set(items.flatMap((item) => [item.imageUrl, item.thumbnailUrl]).filter((url): url is string => Boolean(url && isOwnedBlobImage(url))))];
}
