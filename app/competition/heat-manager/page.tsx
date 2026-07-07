"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { useEventOSStore } from "@/components/competition/eventos-store";
import {
  getCurrentHeat,
  getDriversInHeat,
  getHeatProgress,
  getHeatResults,
  getHeatWinner,
  getNextHeat,
} from "@/components/competition/heat-engine";
import { getApprovedResults, getAverageScore } from "@/components/competition/result-engine";
import { drivers } from "@/data/drivers";
import type { HeatStatus } from "@/data/heats";

const statusStyles: Record<HeatStatus, string> = {
  waiting: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  ready: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  active: "border-green-500/30 bg-green-500/10 text-green-400",
  finished: "border-white/10 bg-white/10 text-zinc-300",
};

const statusLabels: Record<HeatStatus, string> = {
  waiting: "Afventer",
  ready: "Klar",
  active: "Live",
  finished: "Afsluttet",
};

function getDriverName(driverId: string) {
  return drivers.find((driver) => driver.id === driverId)?.name ?? "Ukendt kører";
}

export default function HeatManagerPage() {
  const { heats, results, currentHeatId, setCurrentHeat, startHeat, finishHeat } = useEventOSStore();
  const currentHeat = heats.find((heat) => heat.id === currentHeatId) ?? getCurrentHeat(heats);
  const nextHeat = getNextHeat(heats);
  const currentProgress = currentHeat ? getHeatProgress(currentHeat) : undefined;

  function handleStartHeat(heatId: string) {
    startHeat(heatId);
  }

  function handleFinishHeat(heatId: string) {
    finishHeat(heatId);
  }

  function handleNextHeat() {
    if (nextHeat) {
      setCurrentHeat(nextHeat.id);
    }
  }

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
                  DarkLight EventOS
                </p>
                <h1 className="text-4xl font-black md:text-6xl">Heat Manager</h1>
                <p className="mt-5 max-w-3xl text-zinc-400">
                  Heat-kontrol til FiveM/RP events. Start, Afslut og
                  Næste heat opdaterer EventOS med det samme.
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-zinc-300">
                Aktuelt heat: {currentHeat ? `Heat ${currentHeat.heatNumber}` : "Ingen"}
              </div>
            </div>

            <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Heats i alt" value={heats.length} text="Planlagt i EventOS" />
              <StatCard title="Aktuelt heat" value={currentHeat ? `#${currentHeat.heatNumber}` : "-"} text={currentHeat ? statusLabels[currentHeat.status] : "Afventer"} />
              <StatCard title="Næste heat" value={nextHeat ? `#${nextHeat.heatNumber}` : "-"} text={nextHeat ? statusLabels[nextHeat.status] : "Ingen næste"} />
              <StatCard title="Fremdrift" value={`${currentProgress?.percent ?? 0}%`} text="Aktuelt heat" />
            </div>

            <div className="mb-8 grid gap-8 xl:grid-cols-[1fr_380px]">
              <Panel title="Aktuelt heat">
                {currentHeat ? (
                  <div className="rounded-[2rem] border border-white/10 bg-black p-6">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                          {currentHeat.eventId}
                        </p>
                        <h2 className="mt-3 text-4xl font-black">Heat {currentHeat.heatNumber}</h2>
                      </div>
                      <StatusBadge status={currentHeat.status} />
                    </div>

                    <div className="mt-7 h-3 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-white" style={{ width: `${currentProgress?.percent ?? 0}%` }} />
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <SummaryLine label="Færdige" value={currentProgress?.completedRuns ?? 0} />
                      <SummaryLine label="Resterende" value={currentProgress?.remainingRuns ?? 0} />
                      <SummaryLine label="Aktuel kører" value={currentHeat.currentDriver ? getDriverName(currentHeat.currentDriver) : "-"} />
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-500">Ingen aktivt heat.</p>
                )}
              </Panel>

              <Panel title="Kontrolhandlinger">
                <div className="grid gap-3">
                  <button onClick={() => currentHeat && handleStartHeat(currentHeat.id)} className="rounded-full bg-white px-5 py-4 font-black text-black transition hover:bg-zinc-300">
                    Start heat
                  </button>
                  <button onClick={() => currentHeat && handleFinishHeat(currentHeat.id)} className="rounded-full border border-white/10 px-5 py-4 font-black text-white transition hover:bg-white hover:text-black">
                    Afslut heat
                  </button>
                  <button onClick={handleNextHeat} className="rounded-full border border-white/10 px-5 py-4 font-black text-zinc-300 transition hover:border-white/30 hover:bg-white/10">
                    Næste heat
                  </button>
                </div>
              </Panel>
            </div>

            <div className="grid gap-6 xl:grid-cols-4">
              {heats.map((heat) => {
                const heatResults = getHeatResults(heat.id, results);
                const approvedResults = getApprovedResults(heatResults);
                const pendingCount = heatResults.filter((score) => score.status === "pending").length;
                const winner = getHeatWinner(heat.id, results);
                const progress = getHeatProgress(heat);

                return (
                  <article key={heat.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{heat.eventId}</p>
                        <h2 className="mt-3 text-3xl font-black">Heat {heat.heatNumber}</h2>
                      </div>
                      <StatusBadge status={heat.status} />
                    </div>

                    <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-white" style={{ width: `${progress.percent}%` }} />
                    </div>

                    <div className="mb-6 grid gap-3">
                      <SummaryLine label="Godkendt" value={approvedResults.length} />
                      <SummaryLine label="Afventer" value={pendingCount} />
                      <SummaryLine label="Gennemsnit" value={getAverageScore(heatResults)} />
                      <SummaryLine label="Vinder" value={winner ? getDriverName(winner.driverId) : "Afventer"} />
                    </div>

                    <div className="grid gap-3">
                      {getDriversInHeat(heat).map((driver) => (
                        <div key={`${heat.id}-${driver.id}`} className="rounded-2xl border border-white/10 bg-black p-4">
                          <h3 className="font-black">{driver.name}</h3>
                          <p className="mt-1 text-sm text-zinc-500">{driver.darklightId}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-2">
                      <button onClick={() => handleStartHeat(heat.id)} className="rounded-full border border-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black">
                        Start
                      </button>
                      <button onClick={() => handleFinishHeat(heat.id)} className="rounded-full border border-white/10 px-4 py-3 text-sm font-black text-zinc-300 transition hover:bg-white/10">
                        Afslut
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </>
  );
}

function StatusBadge({ status }: { status: HeatStatus }) {
  return (
    <span className={`w-fit rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black px-4 py-3">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}
