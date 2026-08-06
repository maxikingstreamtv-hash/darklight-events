import { isPermanentImageUrl, isOwnedBlobImage } from "@/lib/images/image-upload";

export type VoteCandidateInput = {
  ownerName: string | null; vehicleName: string | null; vehicleModel: string | null; imageUrl: string;
  description: string | null; startNumber: string | null; participantId: string | null;
  vehicleId: string | null; ownerUserId: string | null; sortOrder: number;
};

export function readVoteCandidate(formData: FormData): VoteCandidateInput {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const ownerName = text("ownerName") || null; const vehicleName = text("vehicleName") || null; const imageUrl = text("imageUrl");
  if (!imageUrl) throw new Error("Et kandidatbillede er påkrævet.");
  if (!isPermanentImageUrl(imageUrl)) throw new Error("Kandidatbilledet skal være uploadet permanent.");
  return { ownerName, vehicleName, imageUrl, vehicleModel: text("vehicleModel") || null, description: text("description") || null, startNumber: text("startNumber") || null, participantId: text("participantId") || null, vehicleId: text("vehicleId") || null, ownerUserId: text("ownerUserId") || null, sortOrder: Number.parseInt(text("sortOrder"), 10) || 0 };
}

export function canManageVoteCandidates(role: string) { return role === "SUPER_ADMIN" || role === "ADMIN" || role === "EVENT_MANAGER"; }
export function visibleVoteCandidates<T extends { active: boolean; public: boolean; sortOrder: number; createdAt: Date }>(items: T[]) { return items.filter(item => item.active && item.public).sort((a,b)=>a.sortOrder-b.sortOrder || a.createdAt.getTime()-b.createdAt.getTime()); }
export function ownedCandidateBlobUrls(urls: Array<string | null | undefined>) { return [...new Set(urls.filter((url): url is string => Boolean(url && isOwnedBlobImage(url))))]; }
