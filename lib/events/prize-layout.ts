export const PRIZE_FORM_GRID_CLASS = "grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2";
export const PRIZE_FIELD_CLASS = "min-w-0 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none";
export const PRIZE_LABEL_CLASS = "min-w-0 grid gap-2 text-sm font-bold text-zinc-300";
export const PRIZE_COMMAND_CENTER_GRID_CLASS = "grid min-w-0 grid-cols-1 gap-8 2xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]";

export function getPrizeFieldVisibility(prizeType: string) {
  return {
    amount: prizeType === "CASH",
    item: ["VEHICLE", "TROPHY", "VIP", "ITEM", "OTHER"].includes(prizeType),
    sponsor: ["SPONSOR", "TROPHY", "VIP", "ITEM", "SPECIAL", "OTHER"].includes(prizeType),
    award: prizeType === "SPECIAL",
  };
}
