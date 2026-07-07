"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { getChampionshipLeader, getTop10 } from "@/components/competition/season-engine";
import { useEventOSStore } from "@/components/competition/eventos-store";
import { drivers } from "@/data/drivers";
import { seasons } from "@/data/seasons";

function getDriverName(driverId: string) {
  return drivers.find((driver) => driver.id === driverId)?.name ?? "Ukendt driver";
}

function getDriverId(driverId: string) {
  return drivers.find((driver) => driver.id === driverId)?.darklightId ?? "DL-00000";
}

export default function SeasonsPage() {
  const { results } = useEventOSStore();
  const activeSeason = seasons.find((season) => season.status === "active") ?? seasons[0];
  const leader = getChampionshipLeader(results, activeSeason.id);
  const top10 = getTop10(results, activeSeason.id);

  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
              <div>
                <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
                  DarkLight Events
                </p>
                <h1 className="text-4xl font-black md:text-6xl">Mesterskab</h1>
                <p className="mt-5 max-w-3xl text-zinc-400">
                  Sæsonpoint beregnes automatisk fra godkendte resultater i
                  DarkLight Result Engine.
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-zinc-300">
                {activeSeason.title} · {activeSeason.status}
              </div>
            </div>

            <div className="mb-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
              <p className="mb-4 text-sm uppercase tracking-[0.35em] text-zinc-500">
                Mesterskabsleder
              </p>
              {leader ? (
                <div className="grid gap-6 xl:grid-cols-[1fr_260px] xl:items-end">
                  <div>
                    <h2 className="text-5xl font-black md:text-7xl">
                      {getDriverName(leader.driverId)}
                    </h2>
                    <p className="mt-4 text-zinc-500">
                      {getDriverId(leader.driverId)} · #{leader.position}
                    </p>
                  </div>
                  <div className="rounded-[2rem] border border-white/10 bg-black p-6 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Point
                    </p>
                    <p className="mt-3 text-6xl font-black">{leader.points}</p>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500">Ingen sæsonresultater endnu.</p>
              )}
            </div>

            <div className="grid gap-5">
              {top10.map((standing) => (
                <article
                  key={standing.driverId}
                  className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl xl:grid-cols-[90px_1fr_repeat(6,120px)] xl:items-center"
                >
                  <p className="text-3xl font-black">#{standing.position}</p>
                  <div>
                    <h2 className="text-2xl font-black">
                      {getDriverName(standing.driverId)}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {getDriverId(standing.driverId)}
                    </p>
                  </div>
                  <MiniStat label="Point" value={standing.points} />
                  <MiniStat label="Events" value={standing.eventsRun} />
                  <MiniStat label="Sejre" value={standing.wins} />
                  <MiniStat label="Podier" value={standing.podiums} />
                  <MiniStat label="Snit score" value={standing.averageScore} />
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

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
