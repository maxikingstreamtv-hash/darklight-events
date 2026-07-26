import { normalizePrizeCurrency } from "@/lib/events/prize-currency";

export type EventPrizeWinnerClientData = {
  id: string;
  participant: { id: string; name: string; userId: string | null } | null;
  user: { id: string; displayName: string; darklightId: string | null } | null;
  note: string | null;
};

export type EventPrizeClientData = {
  id: string;
  title: string;
  description: string | null;
  prizeType: string;
  placement: number | null;
  amount: string | null;
  currency: string | null;
  itemName: string | null;
  sponsorName: string | null;
  awardLabel: string | null;
  sortOrder: number;
  active: boolean;
  winners: EventPrizeWinnerClientData[];
};

type SerializablePrizeInput = Omit<EventPrizeClientData, "amount" | "currency" | "winners"> & {
  amount: { toString(): string } | string | number | null;
  currency: string | null;
  winners?: Array<{
    id: string;
    participant: { id: string; name: string; userId: string | null } | null;
    user: { id: string; displayName: string; darklightId: string | null } | null;
    note: string | null;
  }>;
};

export function serializeEventPrizeForClient(prize: SerializablePrizeInput): EventPrizeClientData {
  return {
    id: prize.id,
    title: prize.title,
    description: prize.description,
    prizeType: prize.prizeType,
    placement: prize.placement,
    amount: prize.amount === null ? null : String(prize.amount),
    currency: normalizePrizeCurrency(prize.currency),
    itemName: prize.itemName,
    sponsorName: prize.sponsorName,
    awardLabel: prize.awardLabel,
    sortOrder: prize.sortOrder,
    active: prize.active,
    winners: (prize.winners ?? []).map((winner) => ({
      id: winner.id,
      participant: winner.participant ? {
        id: winner.participant.id,
        name: winner.participant.name,
        userId: winner.participant.userId,
      } : null,
      user: winner.user ? {
        id: winner.user.id,
        displayName: winner.user.displayName,
        darklightId: winner.user.darklightId,
      } : null,
      note: winner.note,
    })),
  };
}
