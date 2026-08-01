import { formatResultTime } from "@/lib/events/result-time";

export type LeaderboardResult = {
  id: string;
  participantId: string;
  placement: number;
  points: number | null;
  finishTimeMs: number | null;
  status: string;
  createdAt: Date;
  participant: { name: string; vehicle: string | null; userId?: string | null };
  competition: { title: string; event: { id?: string; title: string; startsAt?: Date } };
};

export type LeaderboardRow = {
  key: string;
  name: string;
  vehicle: string | null;
  resultCount: number;
  bestPlacement: number | null;
  bestTimeMs: number | null;
  totalPoints: number;
  latestResult: LeaderboardResult;
};

export const resultStatusLabel = (status: string) => ({
  DNF: "Ikke fuldført",
  DNS: "Ikke startet",
  DISQUALIFIED: "Diskvalificeret",
  REJECTED: "Afvist",
  PENDING: "Afventer",
  APPROVED: "Godkendt",
}[status] ?? status);

export function buildLeaderboard(results: LeaderboardResult[]): LeaderboardRow[] {
  const rows = new Map<string, LeaderboardRow>();
  for (const result of results) {
    const key = result.participant.userId || result.participantId;
    const validPlacement = result.placement > 0 ? result.placement : null;
    const validTime = result.finishTimeMs != null && result.finishTimeMs >= 0 ? result.finishTimeMs : null;
    const current = rows.get(key);
    if (!current) {
      rows.set(key, {
        key,
        name: result.participant.name,
        vehicle: result.participant.vehicle,
        resultCount: 1,
        bestPlacement: validPlacement,
        bestTimeMs: validTime,
        totalPoints: result.points ?? 0,
        latestResult: result,
      });
      continue;
    }
    current.resultCount += 1;
    current.totalPoints += result.points ?? 0;
    if (validPlacement != null && (current.bestPlacement == null || validPlacement < current.bestPlacement)) current.bestPlacement = validPlacement;
    if (validTime != null && (current.bestTimeMs == null || validTime < current.bestTimeMs)) current.bestTimeMs = validTime;
    if (result.createdAt > current.latestResult.createdAt) current.latestResult = result;
  }
  return [...rows.values()].sort((a, b) =>
    b.totalPoints - a.totalPoints ||
    (a.bestPlacement ?? Number.MAX_SAFE_INTEGER) - (b.bestPlacement ?? Number.MAX_SAFE_INTEGER) ||
    (a.bestTimeMs ?? Number.MAX_SAFE_INTEGER) - (b.bestTimeMs ?? Number.MAX_SAFE_INTEGER) ||
    a.name.localeCompare(b.name, "da")
  );
}

export function leaderboardTime(value: number | null) {
  return value == null ? null : formatResultTime(value);
}
