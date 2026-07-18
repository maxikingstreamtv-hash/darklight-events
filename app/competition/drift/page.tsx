import Link from "next/link";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DriftCompetitionPage() {
  const brackets = await prisma.bracket.findMany({
    where: { type: "DRIFT" },
    orderBy: { createdAt: "desc" },
    include: {
      competition: { include: { event: { select: { id: true, title: true, status: true } } } },
      matches: {
        orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
        include: { participantA: true, participantB: true, winner: true },
      },
    },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <CompetitionLayout>
        <section className="relative overflow-hidden px-6 py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_40%)]" />
          <div className="relative mx-auto max-w-[1500px]">
            <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">Konkurrencecenter</p>
                <h1 className="text-4xl font-black md:text-6xl">Drift Top 32</h1>
                <p className="mt-5 max-w-2xl text-zinc-400">Databasebaseret drift bracket. Brug “Lav køreliste” på eventet til at generere bracket.</p>
              </div>
              <Link href="/competition/heat-manager" className="inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
                Lav køreliste
              </Link>
            </div>

            {brackets.length > 0 ? (
              <div className="grid gap-6">
                {brackets.map((bracket) => (
                  <article key={bracket.id} className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{bracket.competition.event.title} · {bracket.status}</p>
                    <h2 className="mt-3 text-3xl font-black">{bracket.title}</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {bracket.matches.map((match) => (
                        <div key={match.id} className="rounded-2xl border border-white/10 bg-black p-5">
                          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Runde {match.round} · Kamp {match.matchNumber}</p>
                          <p className="mt-3 font-black">{match.participantA?.name ?? "BYE"} vs. {match.participantB?.name ?? "BYE"}</p>
                          <p className="mt-2 text-sm text-zinc-500">{match.winner?.name ? `Vinder: ${match.winner.name}` : match.status}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Ren start</p>
                <h2 className="mt-4 text-3xl font-black">Ingen drift bracket endnu</h2>
                <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">Når staff genererer et drift bracket fra EventOS, vises det her.</p>
              </div>
            )}
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </main>
  );
}
