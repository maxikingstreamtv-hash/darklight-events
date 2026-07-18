"use client";

import { useState } from "react";
import { resetDataAction, type DataResetScope } from "@/app/competition/admin/reset-actions";
import Tooltip from "@/components/competition/ui/Tooltip";

const resetActions: Array<{
  scope: DataResetScope;
  title: string;
  description: string;
}> = [
  { scope: "leaderboard", title: "Nulstil rangliste", description: "Sletter Result-poster i PostgreSQL, som rangliste og profilstatistik beregnes fra." },
  { scope: "results", title: "Nulstil resultater", description: "Sletter alle Result-poster i PostgreSQL." },
  { scope: "hallOfFame", title: "Nulstil Hall of Fame", description: "Sletter offentliggjorte HallOfFame-poster i PostgreSQL." },
  { scope: "season", title: "Nulstil sæsonpoint", description: "Sletter Result-poster i PostgreSQL, som sæsonpoint beregnes fra." },
  { scope: "achievements", title: "Nulstil præstationer", description: "Sletter Result-poster i PostgreSQL, som præstationer beregnes fra." },
  { scope: "participants", title: "Nulstil deltagere", description: "Sletter Participant-poster i PostgreSQL." },
  { scope: "checkIns", title: "Nulstil check-ins", description: "V2 har endnu ikke et check-in felt i Prisma. Handlingen logges, men sletter ingen poster." },
  { scope: "sponsors", title: "Nulstil sponsorer", description: "Sletter Sponsor-poster i PostgreSQL. Public /sponsorer viser derefter empty state." },
  { scope: "permissions", title: "Nulstil tilladelser", description: "V2 eventtilladelser er endnu ikke migreret til Prisma. Brugerroller og auth-permissions bevares." },
  { scope: "gallery", title: "Nulstil galleri", description: "Sletter GalleryImage-poster i PostgreSQL." },
  { scope: "logs", title: "Nulstil event logs", description: "Sletter AuditLog-poster i PostgreSQL undtagen den aktuelle Super Admins egne logs." },
  { scope: "bookings", title: "Nulstil booking-forespørgsler", description: "Sletter BookingRequest-poster i PostgreSQL." },
  { scope: "contacts", title: "Nulstil kontaktbeskeder", description: "Sletter ContactMessage-poster i PostgreSQL." },
  { scope: "all", title: "Nulstil alt event-data", description: "Sletter events, competitions, participants, results, Hall of Fame, eventbookinger, bookingforespørgsler, kontaktbeskeder, galleri og sponsorer. Brugere, roller, badges og auth-permissions bevares." },
];

export default function AdminDataControl({ resetOk = "", resetError = "" }: { resetOk?: string; resetError?: string }) {
  const [activeScope, setActiveScope] = useState<DataResetScope | null>(null);
  const activeAction = resetActions.find((action) => action.scope === activeScope);
  const requiredPhrase = activeScope === "all" ? "NULSTIL ALT EVENT-DATA" : "NULSTIL";

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">Admin Data Control</p>
          <h2 className="mt-3 text-3xl font-black">Nulstil database-data</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            Reset kører server-side mod PostgreSQL via Prisma. Kun SUPER_ADMIN kan gennemføre destruktive nulstillinger. Brugere, login, roller, badges og auth-permissions bevares ved event-data reset.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black p-4 text-xs text-zinc-500">
          <p className="font-black text-zinc-300">Datakilde</p>
          <p className="mt-2 leading-5">PostgreSQL / Prisma. Ingen localStorage-reset for V2-data.</p>
        </div>
      </div>

      {resetOk ? (
        <p className="mt-5 rounded-2xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm font-black text-green-300">
          {resetOk}
        </p>
      ) : null}

      {resetError ? (
        <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-black text-red-200">
          {resetError}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resetActions.map((action) => (
          <Tooltip key={action.scope} className="w-full" text={action.description}>
            <button
              type="button"
              onClick={() => setActiveScope(action.scope)}
              className="h-full w-full rounded-2xl border border-white/10 bg-black p-5 text-left transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.04]"
            >
              <span className="font-black text-white">{action.title}</span>
              <span className="mt-2 block text-sm leading-6 text-zinc-500">{action.description}</span>
            </button>
          </Tooltip>
        ))}
      </div>

      {activeAction ? (
        <form action={resetDataAction.bind(null, activeAction.scope)} className="mt-6 rounded-[2rem] border border-red-500/20 bg-red-500/10 p-5">
          <h3 className="text-xl font-black text-red-200">{activeAction.title}</h3>
          <p className="mt-2 text-sm leading-6 text-red-100/80">
            Skriv <span className="font-black">{requiredPhrase}</span> for at bekræfte. Handlingen gemmes i AuditLog.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              name="confirmation"
              placeholder={`Skriv ${requiredPhrase}`}
              className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/40"
            />
            <Tooltip text="Gennemfører den valgte nulstilling i PostgreSQL.">
              <button
                className="rounded-2xl border border-red-400/40 bg-red-500 px-5 py-3 font-black text-white transition hover:bg-red-400"
              >
                Bekræft reset
              </button>
            </Tooltip>
            <button
              type="button"
              onClick={() => setActiveScope(null)}
              className="rounded-2xl border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black"
            >
              Annuller
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
