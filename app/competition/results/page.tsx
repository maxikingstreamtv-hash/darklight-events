import Link from "next/link";
import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const results = await prisma.result.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      participant: {
        select: {
          name: true,
          vehicle: true,
          number: true,
          team: true,
        },
      },
      competition: {
        select: {
          title: true,
          type: true,
          event: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          displayName: true,
        },
      },
    },
  });

  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Events</p>
                <h1 className="text-4xl font-black md:text-6xl">Resultatstyring</h1>
                <p className="mt-5 max-w-3xl text-zinc-400">
                  Resultaterne vises fra PostgreSQL. Legacy localStorage-godkendelser er fjernet fra runtime.
                </p>
              </div>
              <Link href="/competition/leaderboard" className="w-fit rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
                Åbn live rangliste
              </Link>
            </div>

            <div className="mb-8 grid gap-5 md:grid-cols-3">
              <StatCard title="Resultater" value={results.length} text="Gemte databaseposter" />
              <StatCard title="Events" value={new Set(results.map((result) => result.competition.event.slug)).size} text="Med resultater" />
              <StatCard title="Deltagere" value={new Set(results.map((result) => result.participantId)).size} text="Med placering" />
            </div>

            {results.length > 0 ? (
              <div className="grid gap-5">
                {results.map((result) => (
                  <article key={result.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                    <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                      <div>
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                          <Badge>PostgreSQL</Badge>
                          <Badge>{result.competition.type}</Badge>
                          <Badge>P{result.placement}</Badge>
                        </div>
                        <h3 className="text-2xl font-black">{result.participant.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                          {result.competition.event.title} / {result.competition.title}
                        </p>
                        {result.notes ? <p className="mt-3 text-sm leading-6 text-zinc-400">{result.notes}</p> : null}
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black px-6 py-4 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Point</p>
                        <p className="mt-2 text-4xl font-black">{result.points ?? Math.max(1000 - result.placement, 0)}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <Breakdown label="Køretøj" value={result.participant.vehicle ?? "Ikke angivet"} />
                      <Breakdown label="Team" value={result.participant.team ?? "Ikke angivet"} />
                      <Breakdown label="Oprettet af" value={result.createdBy.displayName} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Database</p>
                <h2 className="mt-4 text-3xl font-black">Ingen resultater endnu</h2>
                <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
                  Resultatlisten er tom, indtil officielle resultater gemmes i PostgreSQL.
                </p>
              </div>
            )}
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </>
  );
}

function StatCard({ title, value, text }: { title: string; value: string | number; text: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-3xl font-black">{value}</p>
      <p className="mt-3 text-sm text-zinc-400">{text}</p>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-300">{children}</span>;
}

function Breakdown({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}
