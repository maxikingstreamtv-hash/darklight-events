import type { ReactNode } from "react";
import type { Driver } from "@/data/drivers";
import type { EventLog } from "@/data/events-log";
import type { ManagedEvent } from "@/data/event-manager";
import type { Heat } from "@/data/heats";
import type { LeaderboardEntry } from "@/components/competition/result-engine";
import Badge from "@/components/competition/ui/Badge";
import Button from "@/components/competition/ui/Button";
import Card from "@/components/competition/ui/Card";
import StatCard from "@/components/competition/ui/StatCard";

const severityStyles = {
  info: "border-white/10 bg-white/[0.04] text-zinc-300",
  success: "border-green-500/30 bg-green-500/10 text-green-400",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-400",
};

export function RaceControlStatusBadge() {
  return <Badge tone="success">EventOS: RP Live</Badge>;
}

export function RaceControlStats({
  currentHeat,
  currentDriverName,
  nextDriverName,
  nextHeat,
}: {
  currentHeat?: Heat;
  currentDriverName: string;
  nextDriverName: string;
  nextHeat?: Heat;
}) {
  return (
    <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Aktuelt heat" value={currentHeat ? `#${currentHeat.heatNumber}` : "-"} text={currentHeat?.status ?? "Afventer"} />
      <StatCard title="Aktuel kører" value={currentDriverName} text="Ved startlinjen" />
      <StatCard title="Næste kører" value={nextDriverName} text="Klargøres af staff" />
      <StatCard title="Næste heat" value={nextHeat ? `#${nextHeat.heatNumber}` : "-"} text={nextHeat?.status ?? "Afventer"} />
    </div>
  );
}

export function RacePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-7">
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      {children}
    </Card>
  );
}

export function EventStatusPanel({
  activeEvent,
  heatProgressPercent,
  completedRuns,
  remainingRuns,
  heatWinnerName,
}: {
  activeEvent?: ManagedEvent;
  heatProgressPercent: number;
  completedRuns: number;
  remainingRuns: number;
  heatWinnerName: string;
}) {
  return (
    <RacePanel title="Eventstatus">
      <div className="rounded-[2rem] border border-white/10 bg-black p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
          {activeEvent?.type ?? "Event"} · {activeEvent?.status ?? "Klar"}
        </p>
        <h2 className="mt-3 text-4xl font-black">{activeEvent?.title ?? "DarkLight Event"}</h2>
        <p className="mt-4 text-zinc-500">
          {activeEvent?.date} kl. {activeEvent?.time} · {activeEvent?.location}
        </p>
        <div className="mt-7 h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white" style={{ width: `${heatProgressPercent}%` }} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MiniStat label="Runs færdige" value={completedRuns} />
          <MiniStat label="Resterende" value={remainingRuns} />
          <MiniStat label="Heat-vinder" value={heatWinnerName} />
        </div>
      </div>
    </RacePanel>
  );
}

export function CountdownPanel() {
  return (
    <RacePanel title="Nedtælling">
      <div className="flex min-h-[260px] flex-col justify-center rounded-[2rem] border border-white/10 bg-black p-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Næste RP startvindue</p>
        <p className="mt-6 text-6xl font-black md:text-7xl">02:30</p>
        <p className="mt-5 text-sm text-zinc-500">Løbskontrol kalder næste kører over radioen.</p>
      </div>
    </RacePanel>
  );
}

export function LeaderboardSummaryPanel({ leaderboard, getDriverName }: { leaderboard: LeaderboardEntry[]; getDriverName: (driverId: string) => string }) {
  return (
    <RacePanel title="Rangliste overblik">
      <div className="grid gap-3">
        {leaderboard.map((entry) => (
          <div key={entry.driverId} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black p-4">
            <div>
              <p className="font-black">#{entry.position} {getDriverName(entry.driverId)}</p>
              <p className="mt-1 text-sm text-zinc-500">Bedst {entry.bestScore} · Snit {entry.averageScore}</p>
            </div>
            <p className="text-2xl font-black">{entry.total}</p>
          </div>
        ))}
      </div>
    </RacePanel>
  );
}

export function JudgeStatusPanel({ approvedCount, pendingCount, checkedInLabel, championshipLeader }: { approvedCount: number; pendingCount: number; checkedInLabel: string; championshipLeader: string }) {
  return (
    <RacePanel title="Dommerstatus">
      <div className="grid gap-3">
        <MiniStat label="Godkendte scores" value={approvedCount} />
        <MiniStat label="Afventer review" value={pendingCount} />
        <MiniStat label="Checket ind" value={checkedInLabel} />
        <MiniStat label="Sæsonleder" value={championshipLeader} />
      </div>
    </RacePanel>
  );
}

export function QuickActionsPanel({ onStartHeat, onFinishHeat, onNextHeat, onEmergencyStop }: { onStartHeat: () => void; onFinishHeat: () => void; onNextHeat: () => void; onEmergencyStop: () => void }) {
  return (
    <RacePanel title="Hurtighandlinger">
      <div className="grid gap-3">
        <Button onClick={onStartHeat} variant="secondary" size="lg">Start heat</Button>
        <Button onClick={onFinishHeat} variant="secondary" size="lg">Afslut heat</Button>
        <Button onClick={onNextHeat} variant="ghost" size="lg">Næste heat</Button>
        <Button onClick={onEmergencyStop} variant="danger" size="lg">Nødstop</Button>
      </div>
    </RacePanel>
  );
}

export function DriversOnDeckPanel({ drivers }: { drivers: Driver[] }) {
  return (
    <RacePanel title="Kørere klar">
      <div className="grid gap-3">
        {drivers.length > 0 ? drivers.map((driver) => (
          <div key={driver.id} className="rounded-2xl border border-white/10 bg-black p-4">
            <p className="font-black">{driver.name}</p>
            <p className="mt-1 text-sm text-zinc-500">{driver.darklightId} · {driver.favoriteVehicle}</p>
          </div>
        )) : <p className="text-sm text-zinc-500">Ingen kørere i aktuelt heat.</p>}
      </div>
    </RacePanel>
  );
}

export function LiveEventLogPanel({ logs }: { logs: EventLog[] }) {
  return (
    <RacePanel title="Live eventlog">
      <div className="grid gap-3">
        {logs.map((log) => (
          <div key={log.id} className={`rounded-2xl border p-4 ${severityStyles[log.severity]}`}>
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <p className="text-xs uppercase tracking-[0.3em] opacity-80">{log.time} · {log.category}</p>
              <p className="text-xs font-black uppercase tracking-[0.2em]">{log.severity}</p>
            </div>
            <p className="mt-3 font-bold text-white">{log.message}</p>
          </div>
        ))}
      </div>
    </RacePanel>
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
