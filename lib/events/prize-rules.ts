export function getPublicPrizes<T extends { active: boolean }>(prizes: T[]) {
  return prizes.filter((prize) => prize.active);
}

export function hasPrizeAssignment(assignments: Array<{ participantId: string | null }>, participantId: string) {
  return assignments.some((assignment) => assignment.participantId === participantId);
}

export function canDeletePrize(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export const MAX_PRIZE_PARTS_PER_PLACEMENT = 5;

export function canAddPrizePart(existingCount: number, placement: number | null) {
  return placement === null || existingCount < MAX_PRIZE_PARTS_PER_PLACEMENT;
}

export function assertPrizePartLimit(existingCount: number, placement: number | null) {
  if (!canAddPrizePart(existingCount, placement)) {
    throw new Error("Denne placering har allerede det maksimale antal på 5 præmiedele.");
  }
}

export function prizeIdentity(prizeId: string) {
  return { id: prizeId };
}

export type GroupablePrize = {
  id: string;
  placement: number | null;
  sortOrder: number;
  createdAt?: Date | string;
  title: string;
};

export type PrizeGroup<T extends GroupablePrize> = {
  key: string;
  placement: number | null;
  label: string;
  prizes: T[];
};

export function prizeGroupLabel(placement: number | null) {
  if (placement === null) return "Særpræmier";
  return `${placement}. plads`;
}

export function groupPrizesByPlacement<T extends GroupablePrize>(prizes: T[]): PrizeGroup<T>[] {
  const groups = new Map<number | null, T[]>();

  for (const prize of prizes) {
    groups.set(prize.placement, [...(groups.get(prize.placement) ?? []), prize]);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => {
      if (left === null) return 1;
      if (right === null) return -1;
      return left - right;
    })
    .map(([placement, groupedPrizes]) => ({
      key: placement === null ? "special" : `placement-${placement}`,
      placement,
      label: prizeGroupLabel(placement),
      prizes: [...groupedPrizes].sort((left, right) => {
        const orderDifference = left.sortOrder - right.sortOrder;
        if (orderDifference !== 0) return orderDifference;
        const createdDifference = new Date(left.createdAt ?? 0).getTime() - new Date(right.createdAt ?? 0).getTime();
        if (createdDifference !== 0) return createdDifference;
        return left.title.localeCompare(right.title, "da");
      }),
    }));
}

export function getPublicPrizeGroups<T extends GroupablePrize & { active: boolean }>(prizes: T[], usesPrizes: boolean) {
  if (!usesPrizes) return [];
  return groupPrizesByPlacement(getPublicPrizes(prizes)).map((group) => ({
    ...group,
    prizes: group.placement === null ? group.prizes : group.prizes.slice(0, MAX_PRIZE_PARTS_PER_PLACEMENT),
  }));
}
