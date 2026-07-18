import Link from "next/link";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DragCompetitionPage() {
  const competitions = await prisma.competition.findMany({
    where: { type: "DRAG" },
    orderBy: { createdAt: "desc" },
    include: {
      event: { select: { id: true, title: true, status: true } },
      participants: true,
      results: { orderBy: [{ placement: "asc" }], include: { participant: true } },
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
    <main className="min-h-screen bg-black text-white">
      <CompetitionLayout>
        <section className="relative overflow-hidden px-6 py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_40%)]" />
          <div className="relative mx-auto max-w-[1500px]">
            <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">Konkurrencecenter</p>
                <h1 className="text-4xl font-black md:text-6xl">Drag ladder</h1>
                <p className="mt-5 max-w-2xl text-zinc-400">Drag bracket, tider og resultater fra PostgreSQL.</p>
              </div>
              <Link href="/competition/heat-manager" className="w-fit rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
                Generér bracket
              </Link>
            </div>

            {competitions.length > 0 ? (
              <div className="grid gap-6">
                {competitions.map((competition) => (
                  <article key={competition.id} className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{competition.event.title} · {competition.event.status}</p>
                    <h2 className="mt-3 text-3xl font-black">{competition.title}</h2>
                    <div className="mt-6 grid gap-5 xl:grid-cols-2">
                      <Panel title="Bracket">
                        {competition.brackets.flatMap((bracket) => bracket.matches).map((match) => (
                          <Row key={match.id} title={`Runde ${match.round} · Kamp ${match.matchNumber}`} text={`${match.participantA?.name ?? "BYE"} vs. ${match.participantB?.name ?? "BYE"} · ${match.winner?.name ? `Vinder: ${match.winner.name}` : match.status}`} />
                        ))}
                        {competition.brackets.length === 0 ? <p className="text-sm text-zinc-500">Ingen bracket endnu.</p> : null}
                      </Panel>
                      <Panel title="Tider og resultater">
                        {competition.results.map((result) => (
                          <Row key={result.id} title={`P${result.placement} · ${result.participant.name}`} text={`${result.points ?? 0} point · ${result.status}`} />
                        ))}
                        {competition.results.length === 0 ? <p className="text-sm text-zinc-500">Ingen resultater endnu.</p> : null}
                      </Panel>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Ren start</p>
                <h2 className="mt-4 text-3xl font-black">Ingen drag-konkurrencer endnu</h2>
                <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">Når drag-konkurrencer gemmes i EventOS, vises ladder og resultater her.</p>
              </div>
            )}
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-5">
      <h3 className="text-xl font-black">{title}</h3>
      <div className="mt-4 grid gap-3">{children}</div>
    </div>
  );
}

function Row({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{text}</p>
    </div>
  );
}
