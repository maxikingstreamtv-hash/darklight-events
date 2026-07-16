import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type LeaderboardRow = {
  participantId: string;
  name: string;
  vehicle: string | null;
  competitions: number;
  bestPlacement: number;
  totalPoints: number;
  latestResultAt: Date;
};

function buildLeaderboard(results: Array<{
  participantId: string;
  placement: number;
  points: number | null;
  createdAt: Date;
  participant: {
    name: string;
    vehicle: string | null;
  };
}>) {
  const rows = new Map<string, LeaderboardRow>();

  for (const result of results) {
    const existing = rows.get(result.participantId);
    const points = result.points ?? Math.max(1000 - result.placement, 0);

    if (!existing) {
      rows.set(result.participantId, {
        participantId: result.participantId,
        name: result.participant.name,
        vehicle: result.participant.vehicle,
        competitions: 1,
        bestPlacement: result.placement,
        totalPoints: points,
        latestResultAt: result.createdAt,
      });
      continue;
    }

    existing.competitions += 1;
    existing.bestPlacement = Math.min(existing.bestPlacement, result.placement);
    existing.totalPoints += points;
    if (result.createdAt > existing.latestResultAt) {
      existing.latestResultAt = result.createdAt;
    }
  }

  return [...rows.values()].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (a.bestPlacement !== b.bestPlacement) return a.bestPlacement - b.bestPlacement;
    return b.latestResultAt.getTime() - a.latestResultAt.getTime();
  });
}

export default async function PublicLeaderboardPage() {
  const results = await prisma.result.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      participant: {
        select: {
          name: true,
          vehicle: true,
        },
      },
      competition: {
        select: {
          title: true,
          event: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });
  const leaderboard = buildLeaderboard(results);
  const latestResults = results.slice(0, 5);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight spillerportal</p>
              <h1 className="text-5xl font-black md:text-7xl">Rangliste</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">
                Ranglisten læser direkte fra godkendte database-resultater i DarkLight EventOS.
              </p>
            </div>
            <Link href="/events" className="w-fit rounded-full border border-white/15 px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
              Se events
            </Link>
          </div>

          {leaderboard.length > 0 ? (
            <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
              <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <div className="hidden grid-cols-[90px_1fr_150px_150px_150px] gap-4 border-b border-white/10 bg-white/[0.06] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 xl:grid">
                  <span>Plads</span>
                  <span>Deltager</span>
                  <span>Point</span>
                  <span>Bedst</span>
                  <span>Resultater</span>
                </div>
                <div className="divide-y divide-white/10">
                  {leaderboard.map((row, index) => (
                    <article key={row.participantId} className="grid gap-3 bg-black/70 px-6 py-5 transition hover:bg-white/[0.04] xl:grid-cols-[90px_1fr_150px_150px_150px] xl:items-center">
                      <p className="text-3xl font-black">#{index + 1}</p>
                      <div>
                        <h2 className="text-xl font-black">{row.name}</h2>
                        <p className="mt-1 text-sm text-zinc-500">{row.vehicle ?? "Køretøj ikke angivet"}</p>
                      </div>
                      <p className="text-lg font-black">{row.totalPoints}</p>
                      <p className="text-zinc-300">P{row.bestPlacement}</p>
                      <p className="text-zinc-400">{row.competitions}</p>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">Seneste</p>
                <h2 className="mt-3 text-2xl font-black">Nyeste resultater</h2>
                <div className="mt-6 grid gap-4">
                  {latestResults.map((result) => (
                    <div key={result.id} className="rounded-2xl border border-white/10 bg-black p-4">
                      <p className="font-black">{result.participant.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {result.competition.event.title} / {result.competition.title}
                      </p>
                      <p className="mt-3 text-sm font-black text-zinc-300">
                        P{result.placement} · {result.points ?? Math.max(1000 - result.placement, 0)} point
                      </p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          ) : (
            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Ren start</p>
              <h2 className="mt-4 text-3xl font-black">Ingen database-resultater endnu</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
                Ranglisten vises, når EventOS har gemt de første officielle resultater i PostgreSQL.
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
