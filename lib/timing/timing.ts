export const TERMINAL_TIMING_STATUSES = ["FINISHED", "DNF", "DNS", "DISQUALIFIED"] as const;

export function timingActiveKey(eventId: string, competitionId: string) {
  return `${eventId}:${competitionId}`;
}

export function calculateElapsedMs(startedAt: Date, stoppedAt: Date) {
  const elapsed = stoppedAt.getTime() - startedAt.getTime();
  if (!Number.isSafeInteger(elapsed) || elapsed < 0) throw new Error("Den målte tid kan ikke være negativ.");
  return elapsed;
}

export function formatTimingMs(value: number | null | undefined) {
  if (value == null || value < 0 || !Number.isFinite(value)) return "00:00.000";
  const total = Math.floor(value);
  const milliseconds = total % 1000;
  const totalSeconds = Math.floor(total / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  const suffix = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
  return hours > 0 ? `${String(hours).padStart(2, "0")}:${suffix}` : suffix;
}

export function isTerminalTimingStatus(status: string) {
  return TERMINAL_TIMING_STATUSES.some((candidate) => candidate === status);
}

export function provisionalPlacements<T extends { id: string; status: string; elapsedMs: number | null }>(entries: T[]) {
  return new Map(entries
    .filter((entry) => entry.status === "FINISHED" && entry.elapsedMs != null)
    .sort((a, b) => (a.elapsedMs ?? 0) - (b.elapsedMs ?? 0) || a.id.localeCompare(b.id))
    .map((entry, index) => [entry.id, index + 1]));
}

export function timingSummary(entries: Array<{ status: string }>) {
  const count = (status: string) => entries.filter((entry) => entry.status === status).length;
  return {
    total: entries.length,
    running: count("RUNNING"),
    finished: count("FINISHED"),
    dnf: count("DNF"),
    dns: count("DNS"),
    disqualified: count("DISQUALIFIED"),
    missing: entries.filter((entry) => entry.status === "READY" || entry.status === "RUNNING").length,
    allTerminal: entries.length > 0 && entries.every((entry) => isTerminalTimingStatus(entry.status)),
  };
}

export function timingStatusLabel(status: string) {
  return ({ READY: "Klar", RUNNING: "Kører", FINISHED: "Færdig", DNF: "DNF", DNS: "DNS", DISQUALIFIED: "Diskvalificeret", CANCELLED: "Annulleret" } as Record<string, string>)[status] ?? status;
}

export function canManageTiming(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "EVENT_MANAGER";
}

export function canReopenTiming(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function buildTimingResultRows<T extends { id: string; participantId: string; status: string; elapsedMs: number | null; note: string | null }>(entries: T[]) {
  if (!entries.length || !entries.every((entry) => isTerminalTimingStatus(entry.status))) {
    throw new Error("Alle deltagere skal have en slutstatus før overførsel.");
  }
  const placements = provisionalPlacements(entries);
  return entries.map((entry) => ({
    entryId: entry.id,
    participantId: entry.participantId,
    placement: placements.get(entry.id) ?? 0,
    finishTimeMs: entry.status === "FINISHED" ? entry.elapsedMs : null,
    status: entry.status === "FINISHED" ? "APPROVED" as const : entry.status as "DNF" | "DNS" | "DISQUALIFIED",
    notes: entry.note,
  }));
}
