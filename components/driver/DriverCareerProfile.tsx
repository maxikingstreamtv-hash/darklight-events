"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getAchievements } from "@/components/achievement-engine";
import { getCareer } from "@/components/career-engine";
import { getActiveVehicle, getDriverVehicles } from "@/components/competition/garage-engine";
import { getDriverStats, getLiveLeaderboard, getTopThree, sortResultsForPlacement } from "@/components/competition/result-engine";
import { getDriverStanding } from "@/components/competition/season-engine";
import { useEventOSStore, type EventOSDriverResetScope } from "@/components/competition/eventos-store";
import type { Driver } from "@/data/drivers";
import type { ResultScore } from "@/data/results";
import { vehicles } from "@/data/vehicles";

type DriverCareerProfileProps = {
  driver: Driver;
  adminMode?: boolean;
};

type DriverBadge = {
  title: string;
  description: string;
  unlocked: boolean;
};

function formatTime(value?: number) {
  if (typeof value !== "number") return "-";
  return `${value.toFixed(3)}s`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("da-DK", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

export default function DriverCareerProfile({ driver, adminMode = false }: DriverCareerProfileProps) {
  const { results, events, resetDriverData, addEventLog } = useEventOSStore();
  const [displayName, setDisplayName] = useState(driver.name);
  const [status, setStatus] = useState("Aktiv");
  const [editOpen, setEditOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [confirmAction, setConfirmAction] = useState<EventOSDriverResetScope | "delete" | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [message, setMessage] = useState("");

  const stats = getDriverStats(results, driver.id);
  const career = getCareer(driver, results);
  const standing = getDriverStanding(driver.id, results);
  const garage = getDriverVehicles(driver.id);
  const activeVehicle = getActiveVehicle(driver.id);
  const achievements = getAchievements(driver, results, vehicles);
  const leaderboardRows = getLiveLeaderboard(results);
  const driverResults = stats.recentResults;
  const bestEvent = driverResults[0];
  const latestEvent = driverResults[0];
  const trophies = useMemo(() => getTrophies(results, driver.id), [driver.id, results]);
  const badges = getDriverBadges(stats, driverResults, trophies.gold);

  function getEventTitle(eventId: string) {
    return events.find((event) => event.id === eventId)?.title ?? eventId;
  }

  function getEventType(eventId: string) {
    return events.find((event) => event.id === eventId)?.type ?? "Event";
  }

  function getPlacement(eventId: string, resultId: string) {
    const placement = sortResultsForPlacement(results.filter((result) => result.eventId === eventId && result.status === "approved"))
      .findIndex((result) => result.id === resultId);
    return placement >= 0 ? placement + 1 : 0;
  }

  function runConfirmedAction() {
    if (!confirmAction || confirmText.trim().toUpperCase() !== "NULSTIL") return;

    if (confirmAction === "delete") {
      setDeleted(true);
      setMessage(`${displayName} er markeret som slettet lokalt. Statiske driverdata bevares i denne version.`);
      addEventLog({ time: new Intl.DateTimeFormat("da-DK", { hour: "2-digit", minute: "2-digit" }).format(new Date()), category: "Admin driver", message: `DarkLight staff markerede ${driver.id} som slettet lokalt.`, severity: "warning" });
    } else {
      resetDriverData(driver.id, confirmAction, "DarkLight staff");
      setMessage(`${displayName} er nulstillet for ${confirmAction}.`);
    }

    setConfirmAction(null);
    setConfirmText("");
  }

  if (deleted) {
    return (
      <section className="rounded-[2.5rem] border border-red-500/20 bg-red-500/10 p-8 text-white">
        <h1 className="text-4xl font-black">Driver er markeret som slettet</h1>
        <p className="mt-4 text-red-100/80">Dette gælder lokalt i denne session. Permanent sletning kræver database senere.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-8">
      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <Panel title="Driverprofil">
          <div className="flex flex-col gap-8 md:flex-row md:items-end">
            <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-[2rem] border border-white/10 bg-black text-6xl font-black">
              {displayName.split(" ").map((part) => part[0]).join("")}
            </div>
            <div className="min-w-0">
              <p className="mb-3 text-sm uppercase tracking-[0.35em] text-zinc-500">DarkLight kører</p>
              <h1 className="text-5xl font-black md:text-7xl">{displayName}</h1>
              <p className="mt-3 text-xl font-black text-zinc-300">{driver.darklightId}</p>
              <p className="mt-4 text-zinc-400">Medlem siden: Klar til første event · Status: {status} · Omdømme: {career.reputation}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Trofæer">
          <div className="grid grid-cols-3 gap-3">
            <TrophyCard label="Guld" value={trophies.gold} />
            <TrophyCard label="Sølv" value={trophies.silver} />
            <TrophyCard label="Bronze" value={trophies.bronze} />
          </div>
          <div className="mt-6 grid gap-3">
            {badges.map((badge) => (
              <div key={badge.title} className={`rounded-2xl border p-4 ${badge.unlocked ? "border-white/20 bg-white/[0.06]" : "border-white/10 bg-black"}`}>
                <p className="font-black">{badge.title}</p>
                <p className="mt-1 text-sm text-zinc-500">{badge.description}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {message ? <p className="rounded-2xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm font-black text-green-300">{message}</p> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Events" value={stats.eventsParticipated} />
        <StatCard title="Sejre" value={stats.wins} />
        <StatCard title="Podier" value={stats.podiums} />
        <StatCard title="Top 10" value={stats.top10} />
        <StatCard title="Point" value={stats.totalPoints} />
        <StatCard title="Gns. score" value={stats.averageScore || "-"} />
        <StatCard title="Bedste score" value={stats.bestScore || "-"} />
        <StatCard title="Bedste tid" value={formatTime(stats.bestTime)} />
        <StatCard title="DNF" value={stats.dnf} />
        <StatCard title="DNS" value={stats.dns} />
        <StatCard title="Diskvalifikationer" value={stats.disqualifications} />
        <StatCard title="Rangliste" value={leaderboardRows.find((row) => row.driverId === driver.id)?.position ? `#${leaderboardRows.find((row) => row.driverId === driver.id)?.position}` : "-"} />
        <StatCard title="Niveau" value={career.level} />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <Panel title="Karriere">
          <div className="grid gap-3">
            {driverResults.length > 0 ? driverResults.map((result) => {
              const placement = getPlacement(result.eventId, result.id);
              return (
                <Link key={result.id} href={`/events/${result.eventId}`} className="grid gap-3 rounded-2xl border border-white/10 bg-black p-5 transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.04] md:grid-cols-[1fr_90px_110px_110px_120px] md:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{getEventType(result.eventId)}</p>
                    <h3 className="mt-2 font-black">{getEventTitle(result.eventId)}</h3>
                  </div>
                  <p className="font-black">#{placement || "-"}</p>
                  <p className="text-sm text-zinc-300">{result.total} point</p>
                  <p className="text-sm text-zinc-300">{formatTime(result.finalTime ?? result.time)}</p>
                  <p className="text-sm text-zinc-500">{formatDate(result.createdAt)}</p>
                </Link>
              );
            }) : <EmptyState text="Ingen resultathistorik endnu." />}
          </div>
        </Panel>

        <Panel title="Sæsonstatistik">
          <div className="grid gap-3">
            <InfoLine label="Aktuel placering" value={standing.position ? `#${standing.position}` : "-"} />
            <InfoLine label="Point denne sæson" value={String(standing.points)} />
            <InfoLine label="Bedste event" value={bestEvent ? getEventTitle(bestEvent.eventId) : "-"} />
            <InfoLine label="Seneste event" value={latestEvent ? getEventTitle(latestEvent.eventId) : "-"} />
            <InfoLine label="Udvikling" value={stats.eventsParticipated > 0 ? "Aktiv" : "Afventer første event"} />
          </div>
        </Panel>
      </div>

      <Panel title="Garage">
        {garage.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {garage.map((vehicle) => (
              <article key={vehicle.id} className="rounded-[2rem] border border-white/10 bg-black p-5 transition hover:-translate-y-0.5 hover:border-white/30">
                <div className="mb-5 flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-black uppercase tracking-[0.25em] text-zinc-500">Bil</div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black">{vehicle.brand} {vehicle.model}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{vehicle.nickname}</p>
                  </div>
                  {vehicle.id === activeVehicle?.id || vehicle.active ? <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-black text-green-300">Aktiv bil</span> : null}
                </div>
                <div className="mt-4 grid gap-2 text-sm text-zinc-400">
                  <InfoLine label="Klasse" value={vehicle.class} />
                  <InfoLine label="Nummer" value={vehicle.registration} />
                  <InfoLine label="Farve" value={vehicle.color} />
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState text="Ingen biler registreret endnu." />}
      </Panel>

      <Panel title="Præstationer">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {achievements.map((achievement) => {
            const percent = Math.min(Math.round((achievement.progress / achievement.target) * 100), 100);
            const unlockResult = achievement.unlocked ? driverResults.at(-1) : undefined;
            return (
              <article key={achievement.id} className="rounded-[2rem] border border-white/10 bg-black p-5 transition hover:-translate-y-0.5 hover:border-white/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{achievement.category}</p>
                    <h3 className="mt-2 text-lg font-black">{achievement.title}</h3>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${achievement.unlocked ? "bg-green-500/20 text-green-300" : "bg-white/10 text-zinc-400"}`}>
                    {achievement.unlocked ? "Låst op" : "Låst"}
                  </span>
                </div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-500">{achievement.description}</p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-2 text-xs text-zinc-500">{achievement.progress}/{achievement.target}</p>
                {achievement.unlocked ? <p className="mt-2 text-xs text-zinc-500">Låst op: {formatDate(unlockResult?.createdAt)}</p> : null}
              </article>
            );
          })}
        </div>
      </Panel>

      {adminMode ? (
        <Panel title="Admin">
          <div className="grid gap-5">
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setEditOpen((value) => !value)} className="rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">Rediger driver</button>
              <AdminButton label="Nulstil statistik" onClick={() => setConfirmAction("statistics")} />
              <AdminButton label="Nulstil præstationer" onClick={() => setConfirmAction("achievements")} />
              <AdminButton label="Nulstil karriere" onClick={() => setConfirmAction("career")} />
              <AdminButton label="Slet driver" danger onClick={() => setConfirmAction("delete")} />
            </div>

            {editOpen ? (
              <div className="grid gap-3 md:grid-cols-2">
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white" />
                <input value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white" />
              </div>
            ) : null}

            {confirmAction ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                <p className="font-black text-red-100">Bekræft handling</p>
                <p className="mt-2 text-sm leading-6 text-red-100/80">Skriv NULSTIL for at gennemføre. Driverprofilen bevares ved reset.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                  <input value={confirmText} onChange={(event) => setConfirmText(event.target.value)} placeholder="Skriv NULSTIL" className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white" />
                  <button type="button" disabled={confirmText.trim().toUpperCase() !== "NULSTIL"} onClick={runConfirmedAction} className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40">Bekræft</button>
                  <button type="button" onClick={() => { setConfirmAction(null); setConfirmText(""); }} className="rounded-2xl border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">Annuller</button>
                </div>
              </div>
            ) : null}
          </div>
        </Panel>
      ) : null}
    </section>
  );
}

function getTrophies(results: ResultScore[], driverId: string) {
  const eventIds = Array.from(new Set(results.map((result) => result.eventId)));
  return eventIds.reduce(
    (trophies, eventId) => {
      const row = getTopThree(results, eventId).find((entry) => entry.driverId === driverId);
      if (row?.position === 1) trophies.gold += 1;
      if (row?.position === 2) trophies.silver += 1;
      if (row?.position === 3) trophies.bronze += 1;
      return trophies;
    },
    { gold: 0, silver: 0, bronze: 0 }
  );
}

function getDriverBadges(stats: ReturnType<typeof getDriverStats>, results: ReturnType<typeof getDriverStats>["recentResults"], gold: number): DriverBadge[] {
  return [
    { title: "Rookie", description: "Første godkendte event", unlocked: stats.eventsParticipated >= 1 },
    { title: "Drift Specialist", description: "Godkendt drift-resultat", unlocked: results.some((result) => result.eventId.toLowerCase().includes("drift")) },
    { title: "Speed Hunter", description: "Godkendt tid fra racing tablet", unlocked: results.some((result) => result.resultType === "time") },
    { title: "Champion", description: "Mindst én sejr", unlocked: stats.wins >= 1 },
    { title: "Veteran", description: "10 events deltaget", unlocked: stats.eventsParticipated >= 10 },
    { title: "Top Driver", description: "Guld i et event", unlocked: gold >= 1 },
  ];
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-white/25">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-3xl font-black">{value}</p>
    </div>
  );
}

function TrophyCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4 text-center">
      <p className="text-4xl font-black">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-2">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-right text-sm font-black text-white">{value}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black p-6 text-center text-sm font-bold text-zinc-400">{text}</div>;
}

function AdminButton({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full border px-5 py-3 font-black transition ${danger ? "border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500 hover:text-white" : "border-white/10 text-zinc-200 hover:bg-white hover:text-black"}`}>
      {label}
    </button>
  );
}

