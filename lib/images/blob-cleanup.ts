import { del } from "@vercel/blob";
import { isOwnedBlobImage } from "@/lib/images/image-upload";

type DeleteBlob = (url: string | string[]) => Promise<unknown>;

async function safelyDeleteOwnedBlob(url: string | null | undefined, deleteBlob: DeleteBlob) {
  if (!url || !isOwnedBlobImage(url)) return false;
  try {
    await deleteBlob(url);
    return true;
  } catch {
    return false;
  }
}

export async function deleteReplacedBlobImage(
  previousUrl: string | null | undefined,
  nextUrl: string | null | undefined,
  deleteBlob: DeleteBlob = del,
) {
  if (!previousUrl || previousUrl === nextUrl) return false;
  return safelyDeleteOwnedBlob(previousUrl, deleteBlob);
}

export async function deleteNewBlobAfterFailedSave(
  submittedUrl: string | null | undefined,
  previousUrl: string | null | undefined,
  deleteBlob: DeleteBlob = del,
) {
  if (!submittedUrl || submittedUrl === previousUrl) return false;
  return safelyDeleteOwnedBlob(submittedUrl, deleteBlob);
}
