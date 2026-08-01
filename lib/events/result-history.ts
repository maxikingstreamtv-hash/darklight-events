export type ResultHistoryValue = {
  placement: number;
  finishTimeMs: number | null;
  reactionTimeMs: number | null;
  points: number | null;
  status: string;
  notes: string | null;
};

export function resultHistorySnapshot(value: ResultHistoryValue | null | undefined) {
  if (!value) return null;
  return {
    placement: value.placement,
    finishTimeMs: value.finishTimeMs,
    reactionTimeMs: value.reactionTimeMs,
    points: value.points,
    status: value.status,
    notes: value.notes,
  };
}

export function resultHistoryChanged(previous: ResultHistoryValue | null | undefined, next: ResultHistoryValue) {
  return JSON.stringify(resultHistorySnapshot(previous)) !== JSON.stringify(resultHistorySnapshot(next));
}

export function hasPrizePlacementMismatch(
  result: { participantId: string; placement: number },
  prizes: Array<{ placement: number | null; winners: Array<{ participant: { id: string } | null }> }>,
) {
  return prizes.some((prize) => prize.winners.some((winner) => winner.participant?.id === result.participantId) && prize.placement != null && prize.placement !== result.placement);
}
