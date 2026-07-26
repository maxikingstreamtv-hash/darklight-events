export type ResultRuleRow = {
  participantId: string;
  placement: number;
  placementProvided: boolean;
  points: number | null;
  finishTimeMs: number | null;
  status: string;
};

export function validateResultRows(rows: ResultRuleRow[]) {
  const participantIds = rows.map((row) => row.participantId);
  if (new Set(participantIds).size !== participantIds.length) throw new Error("Samme deltager optræder flere gange i resultatlisten.");
  rows.forEach((row, index) => {
    const label = `Række ${index + 1}`;
    if (!row.participantId) throw new Error(`${label}: Deltager mangler.`);
    if (row.placementProvided && row.placement < 1) throw new Error(`${label}: Placering skal være positiv.`);
    if (row.points != null && (row.points < 0 || row.points > 1_000_000)) throw new Error(`${label}: Point er uden for det tilladte interval.`);
    if ((row.status === "DNF" || row.status === "DNS") && row.placementProvided) throw new Error(`${label}: DNF eller DNS må ikke have en normal placering.`);
    if (row.status === "APPROVED" && !row.placementProvided && row.points == null && row.finishTimeMs == null) {
      throw new Error(`${label}: Indtast mindst tid, point eller placering.`);
    }
  });
  const placements = rows.filter((row) => row.status === "APPROVED" && row.placementProvided && row.placement > 0).map((row) => row.placement);
  if (new Set(placements).size !== placements.length) throw new Error("To deltagere må ikke have samme placering.");
}

export function canUnlockResults(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}
