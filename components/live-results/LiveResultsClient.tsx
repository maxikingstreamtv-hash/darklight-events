"use client";

import { useEffect, useState } from "react";

type LivePayload = {
  generatedAt: string;
  announcements?: {
    id: string;
    title: string;
    message: string;
    event: { id: string; title: string };
  }[];
  competitions: {
    id: string;
    title: string;
    type: string;
    event: { id: string; title: string; startsAt: string; status: string } | null;
    results: {
      id: string;
      placement: number;
      points: number | null;
      participant: { name: string; vehicle: string | null; number: string | null; team: string | null };
    }[];
    heats?: {
      id: string;
      title: string;
      status: string;
      entries: { startPosition: number; participant: { name: string; vehicle: string | null; number: string | null } }[];
    }[];
    matches?: {
      id: string;
      round: number;
      matchNumber: number;
      status: string;
      participantA: { name: string; number: string | null } | null;
      participantB: { name: string; number: string | null } | null;
      winner: { name: string; number: string | null } | null;
    }[];
  }[];
};

export default function LiveResultsClient({ initialPayload }: { initialPayload: LivePayload }) {
  const [payload, setPayload] = useState(initialPayload);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch("/api/live-resultater", { cache: "no-store" });
        if (!response.ok) throw new Error("Kunne ikke hente live resultater.");
        setPayload(await response.json());
        setError("");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Live resultater kunne ikke opdateres.");
      }
    }, 7000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-zinc-400 sm:flex-row">
        <span>Opdateres automatisk cirka hvert 7. sekund</span>
        <span>Senest: {new Date(payload.generatedAt).toLocaleTimeString("da-DK")}</span>
      </div>
      {error ? <p className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">{error}</p> : null}
      {payload.announcements && payload.announcements.length > 0 ? (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Live announcements</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {payload.announcements.map((announcement) => (
              <article key={announcement.id} className="rounded-2xl border border-white/10 bg-black p-4">
                <p className="text-sm text-zinc-500">{announcement.event.title}</p>
                <h2 className="mt-2 text-xl font-black">{announcement.title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{announcement.message}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {payload.competitions.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
          <h2 className="text-3xl font-black">Ingen live resultater endnu</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">Når resultater gemmes i PostgreSQL, vises de her uden hardcoded fallback.</p>
        </div>
      ) : payload.competitions.map((competition) => (
        <section key={competition.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{competition.event?.title ?? "Event ikke sat"} · {competition.type}</p>
          <h2 className="mt-3 text-3xl font-black">{competition.title}</h2>
          {competition.heats && competition.heats.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {competition.heats.slice(0, 4).map((heat) => (
                <div key={heat.id} className="rounded-2xl border border-white/10 bg-black p-4">
                  <p className="font-black">{heat.title} · {heat.status}</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {heat.entries.map((entry) => `${entry.startPosition}. ${entry.participant.name}`).join(" / ") || "Ingen deltagere"}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          {competition.matches && competition.matches.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {competition.matches.slice(0, 4).map((match) => (
                <div key={match.id} className="rounded-2xl border border-white/10 bg-black p-4">
                  <p className="font-black">Runde {match.round} · Kamp {match.matchNumber}</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {match.participantA?.name ?? "BYE"} vs. {match.participantB?.name ?? "BYE"} · {match.winner?.name ? `Vinder: ${match.winner.name}` : match.status}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          {competition.results.length === 0 ? (
            <p className="mt-5 text-sm text-zinc-500">Ingen resultater registreret endnu.</p>
          ) : (
            <div className="mt-5 grid gap-3">
              {competition.results.map((result) => (
                <div key={result.id} className="grid gap-3 rounded-2xl border border-white/10 bg-black p-4 sm:grid-cols-[80px_1fr_120px] sm:items-center">
                  <p className="text-2xl font-black">#{result.placement}</p>
                  <div>
                    <p className="font-black">{result.participant.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">{result.participant.vehicle ?? "Køretøj ikke sat"}{result.participant.team ? ` · ${result.participant.team}` : ""}</p>
                  </div>
                  <p className="font-black text-zinc-300">{result.points ?? 0} point</p>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
