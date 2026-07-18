export type SeededParticipant = {
  id: string;
  name: string;
  seed: number | null;
};

export type HeatPlanEntry = {
  participantId: string;
  startPosition: number;
};

export type HeatPlan = {
  heatNumber: number;
  title: string;
  entries: HeatPlanEntry[];
};

export type BracketPlanMatch = {
  round: number;
  matchNumber: number;
  participantAId: string | null;
  participantBId: string | null;
  winnerId?: string | null;
};

function bySeed(participants: SeededParticipant[]) {
  return [...participants].sort((a, b) => {
    const seedA = a.seed ?? Number.MAX_SAFE_INTEGER;
    const seedB = b.seed ?? Number.MAX_SAFE_INTEGER;
    if (seedA !== seedB) return seedA - seedB;
    return a.name.localeCompare(b.name, "da");
  });
}

export function createHeatPlan(
  participants: SeededParticipant[],
  participantsPerHeat: number,
): HeatPlan[] {
  const safePerHeat = Math.max(1, Math.min(participantsPerHeat, 16));
  const seeded = bySeed(participants);
  const heatCount = Math.max(1, Math.ceil(seeded.length / safePerHeat));
  const heats: HeatPlan[] = Array.from({ length: heatCount }, (_, index) => ({
    heatNumber: index + 1,
    title: `Heat ${index + 1}`,
    entries: [],
  }));

  seeded.forEach((participant, index) => {
    const heatIndex = index % heatCount;
    heats[heatIndex].entries.push({
      participantId: participant.id,
      startPosition: heats[heatIndex].entries.length + 1,
    });
  });

  return heats;
}

export function getBracketSize(participantCount: number) {
  if (participantCount >= 17) return 32;
  if (participantCount >= 9) return 16;
  if (participantCount >= 5) return 8;
  if (participantCount >= 3) return 4;
  return 2;
}

export function createBracketPlan(participants: SeededParticipant[]) {
  const seeded = bySeed(participants).slice(0, 32);
  const size = getBracketSize(seeded.length);
  const slots = Array.from({ length: size }, (_, index) => seeded[index]?.id ?? null);
  const matches: BracketPlanMatch[] = [];

  for (let index = 0; index < size; index += 2) {
    const participantAId = slots[index] ?? null;
    const participantBId = slots[index + 1] ?? null;
    matches.push({
      round: 1,
      matchNumber: index / 2 + 1,
      participantAId,
      participantBId,
      winnerId: participantAId && !participantBId ? participantAId : null,
    });
  }

  return { size, matches };
}
