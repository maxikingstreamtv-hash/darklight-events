"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import LiveLeaderboard from "@/components/competition/LiveLeaderboard";
import { getCareer } from "@/components/career-engine";
import { getActiveVehicle } from "@/components/competition/garage-engine";
import { getCurrentHeat, getHeatWinner } from "@/components/competition/heat-engine";
import {
  getAverageScore,
  getBestScore,
  getLeaderboard,
  getPodium,
  getApprovedResults,
} from "@/components/competition/result-engine";
import { getChampionshipLeader } from "@/components/competition/season-engine";
import { useEventOSStore } from "@/components/competition/eventos-store";
import { drivers } from "@/data/drivers";

function getDriverName(driverId: string) {
  return drivers.find((driver) => driver.id === driverId)?.name ?? "Ukendt kører";
}

function getDriverVehicle(driverId: string) {
  const activeVehicle = getActiveVehicle(driverId);

  if (activeVehicle) {
    return activeVehicle.model;
  }

  return drivers.find((driver) => driver.id === driverId)?.favoriteVehicle ?? "Ukendt køretøj";
}

function getDriverLevel(driverId: string, results: Parameters<typeof getCareer>[1]) {
  const driver = drivers.find((item) => item.id === driverId);
  return driver ? getCareer(driver, results).level : "-";
}

export default function LeaderboardPage() {
  const { results, heats, currentHeatId } = useEventOSStore();
  const leaderboard = getLeaderboard(results);
  const podium = getPodium(results);
  const approvedResults = getApprovedResults(results);
  const bestScore = getBestScore(results);
  const averageScore = getAverageScore(results);
  const championshipLeader = getChampionshipLeader(results);
  const currentHeat = getCurrentHeat(heats, currentHeatId);
  const heatWinner = currentHeat ? getHeatWinner(currentHeat.id, results) : undefined;
  const remainingHeats = heats.filter((heat) => heat.status !== "finished").length;
  const latestApprovedScore = [...approvedResults].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  const pendingScoresCount = results.filter((result) => result.status === "pending").length;

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
                <h1 className="text-4xl font-black md:text-6xl">Live rangliste</h1>
                <p className="mt-5 max-w-3xl text-zinc-400">
                  Live rangering baseret på godkendte resultater, aktivt heat og sæsonstatus.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-5 py-3 text-sm font-black text-green-400 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
                <span className="h-2 w-2 rounded-full bg-current" />
                Eventstatus: Live
              </div>
            </div>

            {championshipLeader ? (
              <div className="mb-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl">
                <p className="mb-3 text-sm uppercase tracking-[0.35em] text-zinc-500">
                  Aktuel sæsonleder
                </p>
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                  <div>
                    <h2 className="text-4xl font-black">{getDriverName(championshipLeader.driverId)}</h2>
                    <p className="mt-2 text-zinc-500">
                      Niveau {getDriverLevel(championshipLeader.driverId, results)} · {getDriverVehicle(championshipLeader.driverId)} · #{championshipLeader.position} · {championshipLeader.wins} sejre · {championshipLeader.podiums} podier
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black px-6 py-4 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Sæsonpoint</p>
                    <p className="mt-2 text-5xl font-black">{championshipLeader.points}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Aktuelt heat" value={currentHeat ? `#${currentHeat.heatNumber}` : "-"} text={currentHeat?.status ?? "Afventer"} />
              <StatCard title="Resterende heats" value={remainingHeats} text="Ikke færdige" />
              <StatCard title="Heat-vinder" value={heatWinner ? getDriverName(heatWinner.driverId) : "Afventer"} text={heatWinner ? `${getDriverVehicle(heatWinner.driverId)} · ${heatWinner.total} pts` : "Ingen godkendt score"} />
              <StatCard title="Afventende scores" value={pendingScoresCount} text="Afventer dommergodkendelse" />
            </div>

            <div className="mb-8">
              <LiveLeaderboard
                title="Live rangliste"
                description="Kun godkendte resultater vises her. Point sorteres højest først, tider lavest først, og placeringer laveste placering først."
                showPublicLink
              />
            </div>

            <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Bedste score" value={bestScore?.total ?? 0} text={bestScore ? getDriverName(bestScore.driverId) : "Ingen score"} />
              <StatCard title="Gennemsnitlig score" value={averageScore} text="Godkendte resultater" />
              <StatCard title="Senest godkendt" value={latestApprovedScore?.total ?? 0} text={latestApprovedScore ? getDriverName(latestApprovedScore.driverId) : "Afventer"} />
              <StatCard title="Godkendte scores" value={approvedResults.length} text="Tæller på ranglisten" />
            </div>

            <div className="mb-8 grid gap-5 xl:grid-cols-3">
              {podium.map((entry, index) => (
                <article key={entry.driverId} className={`rounded-[2rem] border bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06] ${index === 0 ? "border-white/30 xl:-mt-4" : "border-white/10 hover:border-white/25"}`}>
                  <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Podie #{entry.position}</p>
                  <h2 className="mt-4 text-3xl font-black">{getDriverName(entry.driverId)}</h2>
                  <p className="mt-2 text-sm text-zinc-500">Niveau {getDriverLevel(entry.driverId, results)} · {getDriverVehicle(entry.driverId)}</p>
                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Total</p>
                      <p className="text-5xl font-black">{entry.total}</p>
                    </div>
                    <p className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-300">Bedst {entry.bestScore}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
              <Panel title="Live rangliste">
                <div className="grid gap-3">
                  {leaderboard.map((entry) => (
                    <div key={entry.driverId} className="grid gap-4 rounded-2xl border border-white/10 bg-black p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.03] md:grid-cols-[80px_1fr_140px_120px] md:items-center">
                      <p className="text-2xl font-black">#{entry.position}</p>
                      <div>
                        <h3 className="text-xl font-black">{getDriverName(entry.driverId)}</h3>
                        <p className="text-sm text-zinc-500">Niveau {getDriverLevel(entry.driverId, results)} · {getDriverVehicle(entry.driverId)}</p>
                        <p className="text-xs text-zinc-600">{entry.scoreCount} godkendte scores</p>
                      </div>
                      <p className="font-black">{entry.total} point</p>
                      <p className="rounded-full border border-white/10 px-4 py-2 text-center text-sm font-black text-zinc-300">Snit {entry.averageScore}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Seneste godkendte score">
                {latestApprovedScore ? (
                  <div className="rounded-2xl border border-white/10 bg-black p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{latestApprovedScore.eventId} · {latestApprovedScore.heatId}</p>
                    <h3 className="mt-3 text-xl font-black">{getDriverName(latestApprovedScore.driverId)}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{getDriverVehicle(latestApprovedScore.driverId)}</p>
                    <p className="mt-3 text-5xl font-black">{latestApprovedScore.total}</p>
                    <p className="mt-3 text-sm text-zinc-500">Dommer: {latestApprovedScore.judge}</p>
                  </div>
                ) : (
                  <p className="text-zinc-500">Ingen godkendte scores endnu.</p>
                )}
              </Panel>
            </div>
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </>
  );
}

function StatCard({ title, value, text }: { title: string; value: string | number; text: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-3xl font-black">{value}</p>
      <p className="mt-3 text-sm text-zinc-400">{text}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl">
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      {children}
    </div>
  );
}
