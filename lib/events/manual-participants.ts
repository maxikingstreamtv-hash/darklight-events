import type { AppRole } from "@/lib/auth/types";

export function canManageManualParticipants(actor: { id: string; role: AppRole }, event: { createdById: string }) {
  if (actor.role === "SUPER_ADMIN" || actor.role === "ADMIN") return true;
  return actor.role === "EVENT_MANAGER" && actor.id === event.createdById;
}

export type ParticipantHistoryCounts = {
  results: number;
  judgeScores: number;
  publicVotes: number;
  timingEntries: number;
  prizeAwards: number;
  heatEntries: number;
  bracketSlots: number;
  bracketOpponents: number;
  winnerMatches: number;
};

export function hasParticipantHistory(counts: ParticipantHistoryCounts) {
  return Object.values(counts).some(count => count > 0);
}

export const participantHistorySelection = {
  results: true,
  judgeScores: true,
  publicVotes: true,
  timingEntries: true,
  prizeAwards: true,
  heatEntries: true,
  bracketSlots: true,
  bracketOpponents: true,
  winnerMatches: true,
} as const;
