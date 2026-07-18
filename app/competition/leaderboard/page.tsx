import Link from "next/link";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompetitionLeaderboardPage() {
  const results = await prisma.result.findMany({
    orderBy: [{ placement: "asc" }, { createdAt: "desc" }],
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
          type: true,
          event: {
            select: {
              title: true,
              id: true,
            },
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
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Events</p>
                <h1 className="text-4xl font-black md:text-6xl">Live rangliste</h1>
                <p className="mt-5 max-w-3xl text-zinc-400">
                  Databasebaseret oversigt over officielle resultater gemt i PostgreSQL.
                </p>
              </div>
              <Link href="/rangliste" className="w-fit rounded-full border border-white/15 px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                Åbn public rangliste
              </Link>
            </div>

            {results.length > 0 ? (
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <div className="hidden grid-cols-[90px_1fr_1fr_130px_130px] gap-4 border-b border-white/10 bg-white/[0.06] px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 xl:grid">
                  <span>Plads</span>
                  <span>Deltager</span>
                  <span>Event</span>
                  <span>Point</span>
                  <span>Type</span>
                </div>
                <div className="divide-y divide-white/10">
                  {results.map((result) => (
                    <article key={result.id} className="grid gap-3 bg-black/70 px-6 py-5 xl:grid-cols-[90px_1fr_1fr_130px_130px] xl:items-center">
                      <p className="text-3xl font-black">P{result.placement}</p>
                      <div>
                        <h2 className="text-xl font-black">{result.participant.name}</h2>
                        <p className="mt-1 text-sm text-zinc-500">{result.participant.vehicle ?? "Køretøj ikke angivet"}</p>
                      </div>
                      <div>
                        <p className="font-black">{result.competition.event.title}</p>
                        <p className="mt-1 text-sm text-zinc-500">{result.competition.title}</p>
                      </div>
                      <p className="font-black">{result.points ?? Math.max(1000 - result.placement, 0)}</p>
                      <p className="text-zinc-400">{result.competition.type}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState title="Ingen resultater endnu" text="Når resultater gemmes i EventOS, vises de her fra PostgreSQL." />
            )}
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center">
      <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Database</p>
      <h2 className="mt-4 text-3xl font-black">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">{text}</p>
    </div>
  );
}
