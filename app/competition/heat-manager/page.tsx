import Link from "next/link";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";
import { generateBracketAction, generateHeatsAction, lockHeatsAction } from "@/app/competition/eventos-actions";

export const dynamic = "force-dynamic";

export default async function HeatManagerPage() {
  const competitions = await prisma.competition.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      event: {
        select: {
          title: true,
          status: true,
          id: true,
        },
      },
      participants: {
        orderBy: [{ seed: "asc" }, { createdAt: "asc" }],
      },
      results: true,
      heats: {
        orderBy: [{ round: "asc" }, { heatNumber: "asc" }],
        include: {
          entries: {
            orderBy: { startPosition: "asc" },
            include: { participant: true },
          },
        },
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
  });

  return (
    <>
      <CompetitionLayout>
        <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative mx-auto max-w-[1500px]">
            <div className="mb-12 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
              <div>
                <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight EventOS</p>
                <h1 className="text-4xl font-black md:text-6xl">Lav køreliste</h1>
                <p className="mt-5 max-w-3xl text-zinc-400">
                  Generér heats og brackets direkte i PostgreSQL. Regenerering blokeres, når heats er låst eller resultater findes.
                </p>
              </div>
              <Link href="/competition/tablet" className="inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
                Åbn Event Tablet
              </Link>
            </div>

            <div className="mb-8 grid gap-5 md:grid-cols-4">
              <StatCard title="Konkurrencer" value={competitions.length} text="Databaseposter" />
              <StatCard title="Deltagere" value={competitions.reduce((total, competition) => total + competition.participants.length, 0)} text="På konkurrencer" />
              <StatCard title="Heats" value={competitions.reduce((total, competition) => total + competition.heats.length, 0)} text="Genereret" />
              <StatCard title="Brackets" value={competitions.reduce((total, competition) => total + competition.brackets.length, 0)} text="Genereret" />
            </div>

            {competitions.length > 0 ? (
              <div className="grid gap-6 xl:grid-cols-2">
                {competitions.map((competition) => {
                  const canGenerate = competition.results.length === 0 && !competition.heats.some((heat) => heat.locked || heat.status === "ACTIVE" || heat.status === "COMPLETED" || heat.status === "LOCKED");

                  return (
                    <article key={competition.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{competition.event.title}</p>
                          <h2 className="mt-3 text-3xl font-black">{competition.title}</h2>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
                          {competition.type}
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-4">
                        <SummaryLine label="Deltagere" value={competition.participants.length} />
                        <SummaryLine label="Resultater" value={competition.results.length} />
                        <SummaryLine label="Heats" value={competition.heats.length} />
                        <SummaryLine label="Bracket" value={competition.brackets[0]?.size ?? "Ingen"} />
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <form action={generateHeatsAction.bind(null, competition.id)} className="flex gap-2">
                          <input name="participantsPerHeat" type="number" min="1" max="16" defaultValue="4" className="w-24 rounded-full border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none" />
                          <button disabled={!canGenerate} className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-40" type="submit">
                            Lav køreliste
                          </button>
                        </form>
                        <form action={lockHeatsAction.bind(null, competition.id)}>
                          <button disabled={competition.heats.length === 0} className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40" type="submit">
                            Lås heats
                          </button>
                        </form>
                        <form action={generateBracketAction.bind(null, competition.id)}>
                          <button disabled={competition.participants.length < 2} className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40" type="submit">
                            Generér bracket
                          </button>
                        </form>
                      </div>

                      <div className="mt-6 grid gap-4">
                        {competition.heats.map((heat) => (
                          <div key={heat.id} className="rounded-2xl border border-white/10 bg-black p-4">
                            <p className="font-black">{heat.title} · {heat.status}</p>
                            <p className="mt-2 text-sm text-zinc-500">
                              {heat.entries.map((entry) => `${entry.startPosition}. ${entry.participant.name}`).join(" / ") || "Ingen deltagere"}
                            </p>
                          </div>
                        ))}
                        {competition.heats.length === 0 ? <p className="text-sm text-zinc-500">Ingen heats endnu.</p> : null}
                      </div>

                      <div className="mt-6 grid gap-4">
                        {competition.brackets.flatMap((bracket) => bracket.matches).map((match) => (
                          <div key={match.id} className="rounded-2xl border border-white/10 bg-black p-4">
                            <p className="font-black">Runde {match.round} · Kamp {match.matchNumber}</p>
                            <p className="mt-2 text-sm text-zinc-500">
                              {match.participantA?.name ?? "BYE"} vs. {match.participantB?.name ?? "BYE"} · {match.winner?.name ? `Vinder: ${match.winner.name}` : "Afventer"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Database</p>
                <h2 className="mt-4 text-3xl font-black">Ingen konkurrencer endnu</h2>
                <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
                  Opret et event med en konkurrence, før kørelister kan genereres.
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
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-4xl font-black">{value}</p>
      <p className="mt-3 text-sm text-zinc-400">{text}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black px-4 py-3">
      <span className="text-xs uppercase tracking-[0.22em] text-zinc-500">{label}</span>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}
