"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { eventDeletionConfirmation } from "@/lib/events/event-deletion";

type Props = {
  title: string;
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
  hasHistoricData: boolean;
};

export default function PermanentDeleteEventForm({ title, action, error, hasHistoricData }: Props) {
  const expected = eventDeletionConfirmation(title);
  const [confirmation, setConfirmation] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <form action={action} className="mt-5 grid min-w-0 gap-4">
      {hasHistoricData ? <p className="rounded-2xl border border-red-400/25 bg-black/30 p-4 text-sm font-bold leading-6 text-red-100">Dette event har historiske data. Permanent sletning fjerner deltagere, resultater, tidstagning, præmier og Hall of Fame-data.</p> : null}
      {error ? <p role="alert" className="rounded-2xl border border-red-400/30 bg-red-950/40 p-4 text-sm font-bold text-red-100">{error}</p> : null}
      <label className="grid min-w-0 gap-2 text-sm font-bold text-red-100">
        For at slette eventet permanent, skriv:
        <strong className="break-words text-base text-white">{expected}</strong>
        <input
          name="confirmation"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="off"
          className="min-w-0 w-full rounded-2xl border border-red-500/30 bg-black px-4 py-3 text-white outline-none focus:border-red-400"
          placeholder={expected}
        />
      </label>
      <label className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-black/30 p-4 text-sm leading-6 text-red-100">
        <input name="confirmPermanentDeletion" type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-1" />
        <span>Jeg forstår, at alle deltagere, resultater, tider og historik slettes permanent</span>
      </label>
      <DeleteButton disabled={confirmation.trim() !== expected || !acknowledged} />
    </form>
  );
}

function DeleteButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return <button disabled={disabled || pending} className="min-h-12 rounded-full bg-red-500 px-6 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40" type="submit">{pending ? "Sletter…" : "Slet event permanent"}</button>;
}
