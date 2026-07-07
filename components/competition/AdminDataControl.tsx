"use client";

import { useState } from "react";
import { useMockSession } from "@/components/auth/use-mock-session";
import {
  EVENTOS_ADMIN_GALLERY_STORAGE_KEY,
  EVENTOS_ADMIN_PERMISSION_STORAGE_KEY,
  EVENTOS_ADMIN_SPONSOR_STORAGE_KEY,
  EVENTOS_BOOKING_STORAGE_KEY,
  EVENTOS_CONTACT_STORAGE_KEY,
  EVENTOS_STATE_STORAGE_KEY,
  useEventOSStore,
  type EventOSResetScope,
} from "@/components/competition/eventos-store";
import Tooltip from "@/components/competition/ui/Tooltip";

const resetActions: Array<{
  scope: EventOSResetScope;
  title: string;
  description: string;
}> = [
  { scope: "leaderboard", title: "Nulstil rangliste", description: "Fjerner godkendte resultater fra ranglisten og rydder Hall of Fame preview." },
  { scope: "results", title: "Nulstil resultater", description: "Fjerner alle pending, godkendte og afviste resultater." },
  { scope: "hallOfFame", title: "Nulstil Hall of Fame", description: "Fjerner offentliggjorte vindere." },
  { scope: "season", title: "Nulstil sæsonpoint", description: "Rydder resultater som sæsonpoint beregnes ud fra." },
  { scope: "achievements", title: "Nulstil præstationer", description: "Rydder eventresultater som præstationer beregnes ud fra." },
  { scope: "participants", title: "Nulstil deltagere", description: "Fjerner tilmeldte deltagere fra EventOS." },
  { scope: "checkIns", title: "Nulstil check-ins", description: "Sætter alle deltagere til ikke checket ind." },
  { scope: "sponsors", title: "Nulstil sponsorer", description: "Rydder lokalt oprettede sponsorer fra adminpanelet." },
  { scope: "permissions", title: "Nulstil tilladelser", description: "Rydder lokalt oprettede tilladelser fra adminpanelet." },
  { scope: "gallery", title: "Nulstil galleri", description: "Rydder lokalt oprettede galleri-elementer fra adminpanelet." },
  { scope: "logs", title: "Nulstil event logs", description: "Rydder aktivitetsloggen og gemmer en admin-reset linje." },
  { scope: "bookings", title: "Nulstil booking-forespørgsler", description: "Rydder gemte booking-forespørgsler fra localStorage." },
  { scope: "contacts", title: "Nulstil kontaktbeskeder", description: "Rydder gemte kontaktbeskeder fra localStorage." },
  { scope: "all", title: "Nulstil alt event-data", description: "Rydder resultater, rangliste, Hall of Fame, deltagere, check-ins, logs, bookings og beskeder." },
];

export const eventOSResetStorageKeys = [
  EVENTOS_STATE_STORAGE_KEY,
  EVENTOS_ADMIN_SPONSOR_STORAGE_KEY,
  EVENTOS_ADMIN_PERMISSION_STORAGE_KEY,
  EVENTOS_ADMIN_GALLERY_STORAGE_KEY,
  EVENTOS_BOOKING_STORAGE_KEY,
  EVENTOS_CONTACT_STORAGE_KEY,
];

export default function AdminDataControl() {
  const session = useMockSession();
  const { resetEventData } = useEventOSStore();
  const [activeScope, setActiveScope] = useState<EventOSResetScope | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [message, setMessage] = useState("");
  const actor = session?.characterName ?? "DarkLight staff";
  const activeAction = resetActions.find((action) => action.scope === activeScope);
  const canReset = confirmText.trim().toUpperCase() === "NULSTIL";

  function runReset() {
    if (!activeAction || !canReset) return;
    resetEventData(activeAction.scope, actor);
    setMessage(`${activeAction.title} er gennemført af ${actor}.`);
    setActiveScope(null);
    setConfirmText("");
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">Admin Data Control</p>
          <h2 className="mt-3 text-3xl font-black">Nulstil og ryd eventdata</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Reset påvirker kun manuelle eventdata og lokale beskeder. Staff accounts, Cole Kane, Izadora Solis, templates, public sider og design bevares.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black p-4 text-xs text-zinc-500">
          <p className="font-black text-zinc-300">LocalStorage keys</p>
          <div className="mt-2 grid gap-1">
            {eventOSResetStorageKeys.map((key) => <code key={key}>{key}</code>)}
          </div>
        </div>
      </div>

      {message ? (
        <p className="mt-5 rounded-2xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm font-black text-green-300">
          {message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resetActions.map((action) => (
          <Tooltip key={action.scope} className="w-full" text={action.scope === "leaderboard" ? "Rydder ranglisten for nuværende eventdata." : action.description}>
            <button
              type="button"
              onClick={() => { setActiveScope(action.scope); setConfirmText(""); }}
              className="h-full w-full rounded-2xl border border-white/10 bg-black p-5 text-left transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.04]"
            >
              <span className="font-black text-white">{action.title}</span>
              <span className="mt-2 block text-sm leading-6 text-zinc-500">{action.description}</span>
            </button>
          </Tooltip>
        ))}
      </div>

      {activeAction ? (
        <div className="mt-6 rounded-[2rem] border border-red-500/20 bg-red-500/10 p-5">
          <h3 className="text-xl font-black text-red-200">{activeAction.title}</h3>
          <p className="mt-2 text-sm leading-6 text-red-100/80">
            Skriv <span className="font-black">NULSTIL</span> for at bekræfte. Handlingen gemmes i admin-loggen.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="Skriv NULSTIL"
              className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/40"
            />
            <Tooltip text="Gennemfører den valgte nulstilling og skriver handlingen i admin-loggen.">
              <button
                type="button"
                disabled={!canReset}
                onClick={runReset}
                className="rounded-2xl border border-red-400/40 bg-red-500 px-5 py-3 font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Bekræft reset
              </button>
            </Tooltip>
            <button
              type="button"
              onClick={() => { setActiveScope(null); setConfirmText(""); }}
              className="rounded-2xl border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black"
            >
              Annuller
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

