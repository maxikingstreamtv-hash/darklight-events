import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LiveEventCenterPage() {
  const events = await prisma.event.findMany({
    where: {
      active: true,
    },
    orderBy: [{ startsAt: "desc" }, { title: "asc" }],
    include: {
      competitions: {
        include: {
          participants: true,
          results: true,
          heats: {
            orderBy: [{ round: "asc" }, { heatNumber: "asc" }],
            include: { entries: { orderBy: { startPosition: "asc" }, include: { participant: true } } },
          },
          brackets: {
            include: {
              matches: {
                orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
                include: { participantA: true, participantB: true, winner: true },
              },
            },
          },
        },
      },
      announcements: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 6,
      },
    },
  });
  const activeEvent = events.find((event) => event.status === "ACTIVE") ?? events[0];
  const competitions = activeEvent?.competitions ?? [];
  const participants = competitions.flatMap((competition) => competition.participants);
  const results = competitions.flatMap((competition) => competition.results);
  const heats = competitions.flatMap((competition) => competition.heats);
  const matches = competitions.flatMap((competition) => competition.brackets.flatMap((bracket) => bracket.matches));

  return (
    <main className="min-h-screen bg-black text-white">
      <CompetitionLayout>
        <section className="relative overflow-hidden px-6 py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />
          <div className="relative mx-auto max-w-7xl">
            <Link href="/competition/control-center" className="mb-10 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-300 transition hover:bg-white hover:text-black">
              Tilbage til Kontrolcenter
            </Link>

            <div className="mb-10">
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Events</p>
              <h1 className="text-5xl font-black md:text-7xl">Livecenter</h1>
              <p className="mt-6 max-w-3xl text-zinc-400">
                Livecenteret viser nu fælles database-status, ikke browserlokal EventOS-state.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Aktivt event" value={activeEvent?.title ?? "Ingen"} />
              <StatCard title="Konkurrencer" value={competitions.length} />
              <StatCard title="Deltagere" value={participants.length} />
              <StatCard title="Resultater" value={results.length} />
              <StatCard title="Heats" value={heats.length} />
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_420px]">
              <Panel title="Aktivt event">
                {activeEvent ? (
                  <div className="rounded-[2rem] border border-white/10 bg-black p-6">
                    <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{activeEvent.status} / PostgreSQL</p>
                    <h2 className="mt-3 text-4xl font-black">{activeEvent.title}</h2>
                    <p className="mt-4 text-zinc-500">
                      {activeEvent.startsAt.toLocaleString("da-DK")} · {activeEvent.location ?? "Lokation ikke angivet"}
                    </p>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                      <StageCard title="Planlagt" active={activeEvent.status === "UPCOMING"} />
                      <StageCard title="Live" active={activeEvent.status === "ACTIVE"} />
                      <StageCard title="Afsluttet" active={activeEvent.status === "COMPLETED"} />
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-500">Ingen aktive events i databasen.</p>
                )}
              </Panel>

              <Panel title="Næste handlinger">
                <div className="grid gap-4">
                  <ControlLink text="Åbn check-in" href="/competition/check-in" />
                  <ControlLink text="Event Tablet" href="/competition/tablet" />
                  <ControlLink text="Lav køreliste" href="/competition/heat-manager" />
                  <ControlLink text="Resultater" href="/competition/results" />
                  <ControlLink text="Public live-resultater" href="/live-resultater" />
                  <ControlLink text="Public rangliste" href="/rangliste" />
                </div>
              </Panel>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-3">
              <Panel title="Deltagere">
                <div className="grid gap-4">
                  {participants.map((participant) => (
                    <DriverRow key={participant.id} name={participant.name} meta={participant.vehicle ?? "Køretøj ikke angivet"} status="Database" />
                  ))}
                  {participants.length === 0 ? <p className="text-zinc-500">Ingen deltagere på det aktive event.</p> : null}
                </div>
              </Panel>

              <Panel title="Seneste resultater">
                <div className="grid gap-4">
                  {results.slice(0, 8).map((result) => (
                    <DriverRow key={result.id} name={`Placering ${result.placement}`} meta={`${result.points ?? Math.max(1000 - result.placement, 0)} point`} status="Resultat" />
                  ))}
                  {results.length === 0 ? <p className="text-zinc-500">Ingen resultater på det aktive event.</p> : null}
                </div>
              </Panel>

              <Panel title="Announcements">
                <div className="grid gap-4">
                  {activeEvent?.announcements.map((announcement) => (
                    <div key={announcement.id} className="rounded-2xl border border-white/10 bg-black p-5">
                      <h3 className="font-black">{announcement.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-500">{announcement.message}</p>
                    </div>
                  ))}
                  {(!activeEvent || activeEvent.announcements.length === 0) ? <p className="text-zinc-500">Ingen live announcements.</p> : null}
                </div>
              </Panel>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-2">
              <Panel title="Kører nu / næste heat">
                <div className="grid gap-4">
                  {heats.slice(0, 6).map((heat) => (
                    <div key={heat.id} className="rounded-2xl border border-white/10 bg-black p-5">
                      <p className="font-black">{heat.title} · {heat.status}</p>
                      <p className="mt-2 text-sm text-zinc-500">
                        {heat.entries.map((entry) => `${entry.startPosition}. ${entry.participant.name}`).join(" / ") || "Ingen deltagere"}
                      </p>
                    </div>
                  ))}
                  {heats.length === 0 ? <p className="text-zinc-500">Ingen heats genereret endnu.</p> : null}
                </div>
              </Panel>

              <Panel title="Live bracket">
                <div className="grid gap-4">
                  {matches.slice(0, 8).map((match) => (
                    <div key={match.id} className="rounded-2xl border border-white/10 bg-black p-5">
                      <p className="font-black">Runde {match.round} · Kamp {match.matchNumber}</p>
                      <p className="mt-2 text-sm text-zinc-500">
                        {match.participantA?.name ?? "BYE"} vs. {match.participantB?.name ?? "BYE"} · {match.winner?.name ? `Vinder: ${match.winner.name}` : match.status}
                      </p>
                    </div>
                  ))}
                  {matches.length === 0 ? <p className="text-zinc-500">Ingen bracket genereret endnu.</p> : null}
                </div>
              </Panel>
            </div>
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-3xl font-black">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function StageCard({ title, active }: { title: string; active?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${active ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-white/10 bg-white/[0.03] text-zinc-500"}`}>
      <p className="text-sm font-black">{title}</p>
    </div>
  );
}

function DriverRow({ name, meta, status }: { name: string; meta: string; status: string }) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black p-5 md:flex-row md:items-center">
      <div>
        <h3 className="text-xl font-black">{name}</h3>
        <p className="mt-1 text-sm text-zinc-500">{meta}</p>
      </div>
      <span className="w-fit rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-300">{status}</span>
    </div>
  );
}

function ControlLink({ text, href }: { text: string; href: string }) {
  return (
    <Link href={href} className="rounded-full border border-white/10 px-5 py-4 text-center font-black text-white transition hover:bg-white hover:text-black">
      {text}
    </Link>
  );
}
