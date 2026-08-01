export function hasCompletePodium(results: Array<{ placement: number }>) {
  const placements = new Set(results.map((result) => result.placement));
  return [1, 2, 3].every((placement) => placements.has(placement));
}

export function podiumResults<T extends { placement: number }>(results: T[]) {
  return [1, 2, 3].map((placement) => results.find((result) => result.placement === placement) ?? null);
}

export function publicPlacementPrizes<T extends { placement: number | null; active: boolean }>(prizes: T[], placement: number) {
  return prizes.filter((prize) => prize.active && prize.placement === placement).slice(0, 5);
}
