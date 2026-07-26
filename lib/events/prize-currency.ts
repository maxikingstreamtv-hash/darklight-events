export const SUPPORTED_PRIZE_CURRENCIES = ["DKK", "USD", "EUR", "GBP"] as const;

export type SupportedPrizeCurrency = (typeof SUPPORTED_PRIZE_CURRENCIES)[number];

const CURRENCY_ALIASES: Record<string, SupportedPrizeCurrency> = {
  DKK: "DKK",
  KRONER: "DKK",
  KRONE: "DKK",
  "DKK KR": "DKK",
  "DANSKE KRONER": "DKK",
  USD: "USD",
  DOLLAR: "USD",
  DOLLARS: "USD",
  "US DOLLAR": "USD",
  "US DOLLARS": "USD",
  EUR: "EUR",
  EURO: "EUR",
  EUROS: "EUR",
  GBP: "GBP",
  PUND: "GBP",
  "BRITISKE PUND": "GBP",
};

export function normalizePrizeCurrency(value: string | null | undefined): SupportedPrizeCurrency | null {
  const normalized = String(value ?? "").trim().replace(/\s+/g, " ").toLocaleUpperCase("da-DK");
  if (!normalized) return null;
  return CURRENCY_ALIASES[normalized] ?? null;
}

export function formatPrizeCurrency(value: number, currency: string | null | undefined) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeCurrency = normalizePrizeCurrency(currency) ?? "DKK";

  try {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(safeValue);
  } catch {
    return `${new Intl.NumberFormat("da-DK", { maximumFractionDigits: 0 }).format(safeValue)} ${safeCurrency}`;
  }
}

export function requirePrizeCurrency(value: string | null | undefined): SupportedPrizeCurrency {
  const currency = normalizePrizeCurrency(value);
  if (!currency) throw new Error("Vælg en gyldig valuta.");
  return currency;
}

export function normalizePrizeCurrencyForType(prizeType: string, value: string | null | undefined) {
  return prizeType === "CASH" ? requirePrizeCurrency(value) : null;
}
