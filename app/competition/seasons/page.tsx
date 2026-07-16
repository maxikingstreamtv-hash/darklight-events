import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Standing = {
  participantId: string;
  name: string;
  points: number;
  eventsRun: number;
  wins: number;
  podiums: number;
  averageFinish: number;
};

function buildStandings(results: Array<{
  participantId: string;
  placement: number;
  points: number | null;
  participant: { name: string };
}>) {
  const standings = new Map<string, Standing>();

  for (const result of results) {
    const points = result.points ?? Math.max(1000 - result.placement, 0);
    const current = standings.get(result.participantId);

    if (!current) {
      standings.set(result.participantId, {
        participantId: result.participantId,
        name: result.participant.name,
        points,
        eventsRun: 1,
        wins: result.placement === 1 ? 1 : 0,
        podiums: result.placement <= 3 ? 1 : 0,
        averageFinish: result.placement,
      });
      continue;
    }

    current.points += points;
    current.eventsRun += 1;
    current.wins += result.placement === 1 ? 1 : 0;
    current.podiums += result.placement <= 3 ? 1 : 0;
    current.averageFinish = Math.round(((current.averageFinish * (current.eventsRun - 1)) + result.placement) / current.eventsRun);
  }

  return [...standings.values()].sort((a, b) => b.points - a.points);
}

export default async function SeasonsPage() {
  const results = await prisma.result.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      participant: {
        select: {
          name: true,
        },
      },
    },
  });
  const standings = buildStandings(results);
  const leader = standings[0];

  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
              <div>
                <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Events</p>
                <h1 className="text-4xl font-black md:text-6xl">Mesterskab</h1>
                <p className="mt-5 max-w-3xl text-zinc-400">
                  Sæsonpoint beregnes fra resultater gemt i PostgreSQL. Ingen hardcoded sæsondata bruges som runtime-kilde.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-zinc-300">
                PostgreSQL / Result
              </div>
            </div>

            <div className="mb-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
              <p className="mb-4 text-sm uppercase tracking-[0.35em] text-zinc-500">Mesterskabsleder</p>
              {leader ? (
                <div className="grid gap-6 xl:grid-cols-[1fr_260px] xl:items-end">
                  <div>
                    <h2 className="text-5xl font-black md:text-7xl">{leader.name}</h2>
                    <p className="mt-4 text-zinc-500">
                      #{standings.indexOf(leader) + 1} · {leader.wins} sejre · {leader.podiums} podier
                    </p>
                  </div>
                  <div className="rounded-[2rem] border border-white/10 bg-black p-6 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Point</p>
                    <p className="mt-3 text-6xl font-black">{leader.points}</p>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500">Ingen sæsonresultater endnu.</p>
              )}
            </div>

            <div className="grid gap-5">
              {standings.map((standing, index) => (
                <article key={standing.participantId} className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl xl:grid-cols-[90px_1fr_repeat(5,120px)] xl:items-center">
                  <p className="text-3xl font-black">#{index + 1}</p>
                  <div>
                    <h2 className="text-2xl font-black">{standing.name}</h2>
                    <p className="mt-1 text-sm text-zinc-500">Database-deltager</p>
                  </div>
                  <MiniStat label="Point" value={standing.points} />
                  <MiniStat label="Events" value={standing.eventsRun} />
                  <MiniStat label="Sejre" value={standing.wins} />
                  <MiniStat label="Podier" value={standing.podiums} />
                  <MiniStat label="Snit placering" value={standing.averageFinish || "-"} />
                </article>
              ))}
            </div>
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </>
  );
}

function MiniStat({ label, value }: { label: string | number; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
