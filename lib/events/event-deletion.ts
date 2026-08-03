import { isVercelBlobUrl } from "@/lib/events/event-images";

export function eventDeletionConfirmation(title: string) {
  return `SLET ${title}`;
}

export function isValidEventDeletionConfirmation(title: string, value: string) {
  return value.trim() === eventDeletionConfirmation(title);
}

export function canPermanentlyDeleteEvent(role: string) {
  return role === "SUPER_ADMIN";
}

export function uniqueOwnedEventBlobUrls(urls: Array<string | null | undefined>) {
  return [...new Set(urls.filter((url): url is string => Boolean(url && isVercelBlobUrl(url))))];
}
