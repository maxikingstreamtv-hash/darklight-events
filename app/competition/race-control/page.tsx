"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import CompetitionPageShell from "@/components/competition/layout/CompetitionPageShell";
import { useEventOSStore } from "@/components/competition/eventos-store";
import {
  getCurrentHeat,
  getDriversInHeat,
  getHeatProgress,
  getHeatWinner,
  getNextHeat,
} from "@/components/competition/heat-engine";
import {
  calculateFinalTime,
  calculateTotalScore,
  getApprovedResults,
  getDriverResults,
  getLeaderboard,
} from "@/components/competition/result-engine";
import { getChampionshipLeader } from "@/components/competition/season-engine";
import {
  CountdownPanel,
  DriversOnDeckPanel,
  EventStatusPanel,
  JudgeStatusPanel,
  LeaderboardSummaryPanel,
  LiveEventLogPanel,
  QuickActionsPanel,
  RaceControlStats,
  RaceControlStatusBadge,
} from "@/components/competition/race-control/RaceControlPanels";
import { drivers } from "@/data/drivers";
import type { ResultScore } from "@/data/results";

function getDriverName(driverId?: string) {
  if (!driverId) return "Afventer";
  return drivers.find((driver) => driver.id === driverId)?.name ?? "Ukendt kører";
}

function getTimeLabel() {
  return new Intl.DateTimeFormat("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export default function RaceControlPage() {
  const {
    activeEventId,
    currentHeatId,
    events,
    participants,
    heats,
    results,
    logs,
    setCurrentHeat,
    startHeat,
    finishHeat,
    addResult,
    addEventLog,
  } = useEventOSStore();
  const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0];
  const currentHeat = heats.find((heat) => heat.id === currentHeatId) ?? getCurrentHeat(heats);
  const nextHeat = getNextHeat(heats);
  const heatProgress = currentHeat ? getHeatProgress(currentHeat) : undefined;
  const currentDrivers = currentHeat ? getDriversInHeat(currentHeat) : [];
  const nextDriverId = currentHeat?.driverIds[currentHeat.completedRuns + 1];
  const heatWinner = currentHeat ? getHeatWinner(currentHeat.id, results) : undefined;
  const leaderboard = getLeaderboard(results).slice(0, 3);
  const leader = getChampionshipLeader(results);
  const approvedResults = getApprovedResults(results);
  const pendingScores = results.filter((score) => score.status === "pending");
  const eventParticipants = participants.filter((participant) => participant.eventId === activeEvent?.id);
  const checkedIn = eventParticipants.filter((participant) => participant.checkedIn).length;
  const latestLogs = logs.slice(0, 8);

  function handleStartHeat() {
    if (!currentHeat) return;
    startHeat(currentHeat.id);
  }

  function handleFinishHeat() {
    if (!currentHeat) return;
    finishHeat(currentHeat.id);
  }

  function handleNextHeat() {
    if (!nextHeat) return;
    setCurrentHeat(nextHeat.id);
    addEventLog({
      time: getTimeLabel(),
      category: "Løbskontrol",
      message: `Løbskontrol har flyttet livefokus til Heat ${nextHeat.heatNumber}.`,
      severity: "info",
    });
  }

  function handleEmergencyStop() {
    addEventLog({
      time: getTimeLabel(),
      category: "Sikkerhed",
      message: "Nødstop aktiveret af event staff. Alle RP-kørere skal holde position.",
      severity: "danger",
    });
  }

  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <CompetitionPageShell
          eyebrow="FiveM RP eventdrift"
          title="Løbskontrol"
          subtitle="Live kontrolpanel til DarkLight Events på serveren. Staff kan følge heats, kørere, scores og RP-eventloggen fra ét sted."
          actions={<RaceControlStatusBadge />}
          maxWidth="max-w-[1500px]"
        >
          <RaceControlStats
            currentHeat={currentHeat}
            currentDriverName={getDriverName(currentHeat?.currentDriver)}
            nextDriverName={getDriverName(nextDriverId)}
            nextHeat={nextHeat}
          />

          <div className="mb-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <EventStatusPanel
              activeEvent={activeEvent}
              heatProgressPercent={heatProgress?.percent ?? 0}
              completedRuns={heatProgress?.completedRuns ?? 0}
              remainingRuns={heatProgress?.remainingRuns ?? 0}
              heatWinnerName={heatWinner ? getDriverName(heatWinner.driverId) : "Afventer"}
            />
            <CountdownPanel />
          </div>

          <div className="mb-8 grid gap-8 xl:grid-cols-3">
            <LeaderboardSummaryPanel leaderboard={leaderboard} getDriverName={getDriverName} />
            <JudgeStatusPanel
              approvedCount={approvedResults.length}
              pendingCount={pendingScores.length}
              checkedInLabel={`${checkedIn}/${eventParticipants.length}`}
              championshipLeader={leader ? getDriverName(leader.driverId) : "Afventer"}
            />
            <QuickActionsPanel
              onStartHeat={handleStartHeat}
              onFinishHeat={handleFinishHeat}
              onNextHeat={handleNextHeat}
              onEmergencyStop={handleEmergencyStop}
            />
          </div>

          <ManualResultEntryPanel
            activeEventId={activeEvent?.id ?? activeEventId}
            currentHeatId={currentHeat?.id ?? currentHeatId}
            results={results}
            onAddResult={addResult}
          />

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
            <DriversOnDeckPanel drivers={currentDrivers} />
            <LiveEventLogPanel logs={latestLogs} />
          </div>
        </CompetitionPageShell>
      </CompetitionLayout>
      <Footer />
    </>
  );
}

function ManualResultEntryPanel({
  activeEventId,
  currentHeatId,
  results,
  onAddResult,
}: {
  activeEventId: string;
  currentHeatId: string;
  results: ResultScore[];
  onAddResult: (result: ResultScore) => void;
}) {
  const [resultType, setResultType] = useState<"score" | "time">("score");
  const [driverId, setDriverId] = useState(drivers[0]?.id ?? "");
  const [eventId, setEventId] = useState(activeEventId);
  const [heatId, setHeatId] = useState(currentHeatId);
  const [runNumber, setRunNumber] = useState(1);
  const [judge, setJudge] = useState("DarkLight Staff");
  const [style, setStyle] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [angle, setAngle] = useState(0);
  const [line, setLine] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [rawTime, setRawTime] = useState(0);
  const [penaltySeconds, setPenaltySeconds] = useState(0);
  const [notes, setNotes] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const totalScore = useMemo(
    () => calculateTotalScore({ style, speed, angle, line, penalty }),
    [angle, line, penalty, speed, style]
  );
  const finalTime = useMemo(
    () => calculateFinalTime(rawTime, penaltySeconds),
    [penaltySeconds, rawTime]
  );
  const approvedDriverResults = getDriverResults(results, driverId).filter(
    (result) => result.status === "approved"
  );
  const driverBestScore =
    approvedDriverResults.length > 0
      ? Math.max(...approvedDriverResults.map((result) => result.total))
      : 0;
  const driverAverageScore =
    approvedDriverResults.length > 0
      ? Math.round(
          (approvedDriverResults.reduce((sum, result) => sum + result.total, 0) /
            approvedDriverResults.length) *
            10
        ) / 10
      : 0;
  const leaderboardPlacement =
    getLeaderboard(results).find((entry) => entry.driverId === driverId)?.position ?? "-";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onAddResult({
      id: `RS-${Date.now()}`,
      eventId,
      driverId,
      heatId,
      runNumber,
      judge,
      style: resultType === "score" ? style : 0,
      speed: resultType === "score" ? speed : 0,
      angle: resultType === "score" ? angle : 0,
      line: resultType === "score" ? line : 0,
      penalty: resultType === "score" ? penalty : 0,
      total: resultType === "score" ? totalScore : 0,
      time: resultType === "time" ? rawTime : undefined,
      penaltySeconds: resultType === "time" ? penaltySeconds : undefined,
      finalTime: resultType === "time" ? finalTime : undefined,
      notes,
      resultType,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    setSaveMessage("Manuelt resultat er gemt som afventende review.");
    setNotes("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
      <div className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Manuel resultatindtastning</p>
          <h2 className="mt-3 text-3xl font-black">Point og tid</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
            Staff indtaster RP-resultater manuelt. Nye resultater starter som afventende og opdaterer
            rangliste, sæsonpoint, profiler og log, når de godkendes.
          </p>
        </div>
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-black p-1">
          {(["score", "time"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setResultType(type)}
              className={`rounded-xl px-5 py-3 text-sm font-black capitalize ${
                resultType === type ? "bg-white text-black" : "text-zinc-400"
              }`}
            >
              {type === "score" ? "Score" : "Tid"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Select label="Kører" value={driverId} onChange={setDriverId}>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>{driver.name}</option>
          ))}
        </Select>
        <Field label="Event" value={eventId} onChange={setEventId} />
        <Field label="Heat" value={heatId} onChange={setHeatId} />
        <NumberField label="Run" value={runNumber} onChange={setRunNumber} min={1} />
        <Field label="Dommer" value={judge} onChange={setJudge} />
      </div>

      {resultType === "score" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          <NumberField label="Style score" value={style} onChange={setStyle} />
          <NumberField label="Fartscore" value={speed} onChange={setSpeed} />
          <NumberField label="Angle score" value={angle} onChange={setAngle} />
          <NumberField label="Line score" value={line} onChange={setLine} />
          <NumberField label="Straf" value={penalty} onChange={setPenalty} />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <NumberField label="Rå tid" value={rawTime} onChange={setRawTime} step="0.001" />
          <NumberField label="Straffesekunder" value={penaltySeconds} onChange={setPenaltySeconds} step="0.001" />
          <Readout label="Sluttid" value={`${finalTime.toFixed(3)}s`} />
        </div>
      )}

      <label className="mt-4 grid gap-2">
        <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Noter</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-28 rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none transition focus:border-white"
          placeholder="RP-noter, straffe, dommerkommentarer"
        />
      </label>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <Readout label="Total score" value={resultType === "score" ? totalScore : "-"} />
        <Readout label="Placering på rangliste" value={leaderboardPlacement} />
        <Readout label="Bedste score" value={driverBestScore} />
        <Readout label="Gennemsnitlig score" value={driverAverageScore} />
      </div>

      {saveMessage ? (
        <p className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm font-black text-green-400">
          {saveMessage}
        </p>
      ) : null}

      <button className="mt-6 rounded-full bg-white px-6 py-4 font-black text-black transition hover:bg-zinc-300">
        Gem som afventende review
      </button>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none transition focus:border-white"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  step = "1",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none transition focus:border-white"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-white/10 bg-black px-5 py-4 text-white outline-none transition focus:border-white"
      >
        {children}
      </select>
    </label>
  );
}

function Readout({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

