"use client";

import { useState } from "react";
import { getPrizeFieldVisibility, PRIZE_FIELD_CLASS, PRIZE_FORM_GRID_CLASS, PRIZE_LABEL_CLASS } from "@/lib/events/prize-layout";
import { normalizePrizeCurrency, SUPPORTED_PRIZE_CURRENCIES } from "@/lib/events/prize-currency";
import type { EventPrizeClientData } from "@/lib/events/prize-serialization";

const PRIZE_TYPES = ["CASH", "VEHICLE", "TROPHY", "SPONSOR", "VIP", "ITEM", "SPECIAL", "OTHER"] as const;

type EventPrizeFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  prize?: EventPrizeClientData;
  fixedPlacement?: number | null;
  placementLocked?: boolean;
};

export default function EventPrizeForm({ action, submitLabel, prize, fixedPlacement, placementLocked = false }: EventPrizeFormProps) {
  const [prizeType, setPrizeType] = useState(prize?.prizeType ?? "CASH");
  const visibleFields = getPrizeFieldVisibility(prizeType);

  return (
    <form action={action} className="mt-5 min-w-0 space-y-4">
      <label className={PRIZE_LABEL_CLASS}>
        Titel
        <input name="title" defaultValue={prize?.title ?? ""} required className={PRIZE_FIELD_CLASS} placeholder="Fx 1. plads – kontant" />
      </label>

      <div className={PRIZE_FORM_GRID_CLASS}>
        <label className={PRIZE_LABEL_CLASS}>
          Type
          <select name="prizeType" value={prizeType} onChange={(event) => setPrizeType(event.target.value)} className={PRIZE_FIELD_CLASS}>
            {PRIZE_TYPES.map((type) => <option key={type} value={type}>{prizeTypeLabel(type)}</option>)}
          </select>
        </label>
        {placementLocked ? (
          <label className={PRIZE_LABEL_CLASS}>
            Placering
            <input type="text" readOnly value={fixedPlacement === null ? "Særpræmie" : `${fixedPlacement}. plads`} className={`${PRIZE_FIELD_CLASS} cursor-not-allowed text-zinc-400`} />
            <input name="placement" type="hidden" value={fixedPlacement ?? ""} />
          </label>
        ) : (
          <label className={PRIZE_LABEL_CLASS}>
            Placering
            <input name="placement" type="number" min="1" defaultValue={prize?.placement ?? ""} className={PRIZE_FIELD_CLASS} placeholder="Tom for særpræmie" />
          </label>
        )}
      </div>

      <p className="text-xs leading-5 text-zinc-500">Du kan oprette flere præmier til samme placering.</p>

      {visibleFields.amount ? (
        <div className={PRIZE_FORM_GRID_CLASS}>
          <label className={PRIZE_LABEL_CLASS}>
            Beløb
            <input name="amount" inputMode="decimal" defaultValue={formatAmountInput(prize?.amount)} className={PRIZE_FIELD_CLASS} placeholder="Fx 100000" />
          </label>
          <label className={PRIZE_LABEL_CLASS}>
            Valuta
            <select name="currency" defaultValue={normalizePrizeCurrency(prize?.currency) ?? "DKK"} className={PRIZE_FIELD_CLASS} required>
              {SUPPORTED_PRIZE_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>{currencyLabel(currency)}</option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {visibleFields.item ? (
        <label className={PRIZE_LABEL_CLASS}>
          {prizeType === "VEHICLE" ? "Køretøj" : prizeType === "TROPHY" ? "Trofæ" : "Item / præmie"}
          <input name="itemName" defaultValue={prize?.itemName ?? ""} className={PRIZE_FIELD_CLASS} placeholder="Fx Champion Trophy eller VIP-bil" />
        </label>
      ) : null}

      <div className={PRIZE_FORM_GRID_CLASS}>
        {visibleFields.sponsor ? (
          <label className={PRIZE_LABEL_CLASS}>
            Sponsor
            <input name="sponsorName" defaultValue={prize?.sponsorName ?? ""} className={PRIZE_FIELD_CLASS} placeholder="Valgfrit" />
          </label>
        ) : null}
        {visibleFields.award ? (
          <label className={PRIZE_LABEL_CLASS}>
            Award-label
            <input name="awardLabel" defaultValue={prize?.awardLabel ?? ""} className={PRIZE_FIELD_CLASS} placeholder="Fx Fair Play" />
          </label>
        ) : null}
      </div>

      <label className={PRIZE_LABEL_CLASS}>
        Beskrivelse / kriterium
        <textarea name="description" defaultValue={prize?.description ?? ""} rows={3} className={PRIZE_FIELD_CLASS} placeholder="Kort præmietekst eller kriterium" />
      </label>
      <label className="flex min-w-0 items-center gap-3 text-sm font-bold text-zinc-300">
        <input name="active" type="checkbox" defaultChecked={prize?.active ?? true} /> Aktiv og offentlig
      </label>
      <button className="inline-flex max-w-full items-center justify-center rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}

function formatAmountInput(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function prizeTypeLabel(type: string) {
  const labels: Record<string, string> = {
    CASH: "Kontant",
    VEHICLE: "Køretøj",
    TROPHY: "Trofæ",
    SPONSOR: "Sponsor",
    VIP: "VIP",
    ITEM: "Item",
    SPECIAL: "Special",
    OTHER: "Andet",
  };
  return labels[type] ?? type;
}

function currencyLabel(currency: string) {
  const labels: Record<string, string> = {
    DKK: "DKK – Danske kroner",
    USD: "USD – Dollars",
    EUR: "EUR – Euro",
    GBP: "GBP – Britiske pund",
  };
  return labels[currency] ?? currency;
}
