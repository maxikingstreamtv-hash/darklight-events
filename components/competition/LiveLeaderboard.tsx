"use client";

import Link from "next/link";
import { useState } from "react";
import { findAvailableDriver } from "@/components/auth/driver-directory";
import { getLiveLeaderboard, type LiveLeaderboardRow } from "@/components/competition/result-engine";
import { useEventOSStore } from "@/components/competition/eventos-store";

const typeLabels: Record<LiveLeaderboardRow["resultType"], string> = {
  score: "Point",
  time: "Tid",
  placement: "Placering",
};

function getDriver(driverId: string) {
  return findAvailableDriver(driverId);
}

function formatTime(value?: number) {
  if (typeof value !== "number") return "-";
  return `${value.toFixed(3)}s`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("da-DK", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function resultValue(row: LiveLeaderboardRow) {
  if (row.resultType === "time") return formatTime(row.finalTime);
  if (row.resultType === "placement") return `P${row.placement ?? "-"}`;
  return `${row.score ?? 0} point`;
}

export default function LiveLeaderboard({
  title = "Live rangliste",
  description,
  showPublicLink,
}: {
  title?: string;
  description?: string;
  showPublicLink?: boolean;
}) {
  const { results, events } = useEventOSStore();
  const [eventFilter, setEventFilter] = useState("all");
  const rows = getLiveLeaderboard(results, eventFilter === "all" ? undefined : eventFilter);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-6">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">Godkendte resultater</p>
          <h2 className="mt-2 text-2xl font-black md:text-3xl">{title}</h2>
          {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">{description}</p> : null}
        </div>
        {showPublicLink ? (
          <Link href="/rangliste" className="w-fit rounded-full border border-white/10 px-5 py-2.5 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
            Åbn public rangliste
          </Link>
        ) : null}
      </div>

      <div className="mb-5 grid gap-2 md:max-w-sm">
        <label htmlFor="leaderboard-event-filter" className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
          Filtrer på event
        </label>
        <select
          id="leaderboard-event-filter"
          value={eventFilter}
          onChange={(event) => setEventFilter(event.target.value)}
          className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
        >
          <option value="all">Alle events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>{event.title}</option>
          ))}
        </select>
      </div>

      {rows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="hidden grid-cols-[80px_1fr_160px_140px_150px_150px] gap-4 bg-white/[0.06] px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 xl:grid">
            <span>Plads</span>
            <span>Kører</span>
            <span>Event</span>
            <span>Type</span>
            <span>Resultat</span>
            <span>Opdateret</span>
          </div>
          <div className="divide-y divide-white/10">
            {rows.map((row) => {
              const driver = getDriver(row.driverId);
              const event = events.find((item) => item.id === row.eventId);

              return (
                <article key={row.id} className="grid gap-3 bg-black/70 px-5 py-4 transition hover:bg-white/[0.04] xl:grid-cols-[80px_1fr_160px_140px_150px_150px] xl:items-center">
                  <p className="text-2xl font-black">#{row.position}</p>
                  <div>
                    <h3 className="font-black text-white">{driver?.name ?? row.driverId}</h3>
                    <p className="text-sm text-zinc-500">{driver?.darklightId ?? "DL-?????"}</p>
                  </div>
                  <p className="text-sm text-zinc-300">{event?.title ?? row.eventId}</p>
                  <p className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-zinc-300">{typeLabels[row.resultType]}</p>
                  <p className="font-black">{resultValue(row)}</p>
                  <div>
                    <p className="text-sm text-zinc-400">{formatDate(row.updatedAt)}</p>
                    <p className="mt-1 w-fit rounded-full bg-green-500/10 px-3 py-1 text-xs font-black text-green-300">Godkendt</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-black p-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Ren start</p>
          <h3 className="mt-4 text-2xl font-black">Ranglisten opdateres efter første godkendte resultat.</h3>
        </div>
      )}
    </section>
  );
}

