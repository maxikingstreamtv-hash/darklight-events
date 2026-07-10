"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getAvailableDrivers } from "@/components/auth/driver-directory";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import LiveLeaderboard from "@/components/competition/LiveLeaderboard";
import Tooltip from "@/components/competition/ui/Tooltip";
import { useEventOSStore, type EventSponsor } from "@/components/competition/eventos-store";
import { calculateFinalTime, calculateTotalScore, getEventStats, getLiveLeaderboardRows } from "@/components/competition/result-engine";
import { drivers } from "@/data/drivers";
import type { ManagedEvent } from "@/data/event-manager";
import { permissions } from "@/data/permissions";
import type { ResultScore } from "@/data/results";

type DashboardTab = "overview" | "participants" | "results" | "leaderboard" | "winners" | "history" | "gallery" | "sponsors" | "permissions";
type ResultMode = "score" | "time" | "placement";
type DriverFlag = "Klar" | "DNF" | "DNS" | "Diskvalificeret";
type EventResetScope = "participants" | "results" | "leaderboard" | "winners" | "history" | "all";

const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "overview", label: "Oversigt" },
  { id: "participants", label: "Deltagere" },
  { id: "results", label: "Resultater" },
  { id: "leaderboard", label: "Rangliste" },
  { id: "winners", label: "Vindere" },
  { id: "history", label: "Historik" },
  { id: "gallery", label: "Galleri" },
  { id: "sponsors", label: "Sponsorer" },
  { id: "permissions", label: "Tilladelser" },
];

const statusStyles: Record<ManagedEvent["status"], string> = {
  Ready: "border-white/20 bg-white/[0.06] text-zinc-200",
  Live: "border-green-500/30 bg-green-500/10 text-green-300",
  Paused: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  Finished: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  Archived: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
};

const resultLabels: Record<ResultMode, string> = {
  score: "Point",
  time: "Tid",
  placement: "Placering",
};

function nowLabel() {
  return new Intl.DateTimeFormat("da-DK", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function getDriverName(driverId?: string) {
  return drivers.find((driver) => driver.id === driverId)?.name ?? "Ukendt kører";
}

function formatTime(value?: number) {
  if (typeof value !== "number") return "-";
  return `${value.toFixed(3)}s`;
}

export default function EventControlPage() {
  const {
    activeEventId,
    events,
    participants,
    results,
    logs,
    setActiveEvent,
    updateEventStatus,
    addParticipant,
    removeParticipant,
    setParticipantCheckIn,
    addResult,
    updateResult,
    approveResult,
    rejectResult,
    deleteResult,
    publishHallOfFameWinner,
    addEventLog,
    resetSingleEventData,
    hallOfFameWinners,
  } = useEventOSStore();

  const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0];
  const eventParticipants = participants.filter((participant) => participant.eventId === activeEvent?.id);
  const eventResults = results.filter((result) => result.eventId === activeEvent?.id);
  const pendingResults = eventResults.filter((result) => result.status === "pending");
  const approvedResults = eventResults.filter((result) => result.status === "approved");
  const rejectedResults = eventResults.filter((result) => result.status === "rejected");
  const leaderboard = getLiveLeaderboardRows(eventResults);
  const eventStats = activeEvent ? getEventStats(results, activeEvent.id) : undefined;
  const winnersPreview = leaderboard.slice(0, 3);
  const checkedInCount = eventParticipants.filter((participant) => participant.checkedIn).length;
  const eventWinners = hallOfFameWinners.filter((winner) => winner.eventId === activeEvent?.id);

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(activeEvent?.id ?? "");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [newParticipantDriverId, setNewParticipantDriverId] = useState(drivers[0]?.id ?? "");
  const [resultMode, setResultMode] = useState<ResultMode>("score");
  const [judge, setJudge] = useState("Cole Kane");
  const [style, setStyle] = useState(0);
  const [angle, setAngle] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [line, setLine] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [rawTime, setRawTime] = useState(0);
  const [penaltySeconds, setPenaltySeconds] = useState(0);
  const [placement, setPlacement] = useState(1);
  const [notes, setNotes] = useState("");
  const [driverFlags, setDriverFlags] = useState<Record<string, DriverFlag>>({});
  const [rpNotes, setRpNotes] = useState<Record<string, string>>({});
  const [winnerPublished, setWinnerPublished] = useState(false);
  const [resultFeedback, setResultFeedback] = useState("");
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null);
  const [leaderboardFilter, setLeaderboardFilter] = useState<"all" | ResultMode>("all");
  const [resetScope, setResetScope] = useState<EventResetScope | null>(null);
  const [resetConfirm, setResetConfirm] = useState("");
  const [workspaceMessage, setWorkspaceMessage] = useState("");
  const allDrivers = useMemo(() => getAvailableDrivers(), []);
  const availableParticipantDrivers = allDrivers.filter(
    (driver) => !eventParticipants.some((participant) => participant.driverId === driver.id)
  );

  const activeEventDrivers = eventParticipants
    .map((participant) => allDrivers.find((driver) => driver.id === participant.driverId))
    .filter((driver): driver is (typeof drivers)[number] => Boolean(driver));
  const selectedDriverIsParticipant = activeEventDrivers.some((driver) => driver.id === selectedDriverId);
  const resultDriverId = selectedDriverIsParticipant ? selectedDriverId : activeEventDrivers[0]?.id ?? "";
  const canRegisterResult = activeEventDrivers.length > 0 && (Boolean(resultDriverId) || Boolean(editingResultId));
  const filteredLeaderboard = leaderboard
    .filter((entry) => leaderboardFilter === "all" || entry.resultType === leaderboardFilter)
    .slice(0, 10);

  const totalScore = useMemo(
    () => calculateTotalScore({ style, angle, speed, line, penalty }),
    [angle, line, penalty, speed, style]
  );
  const finalTime = useMemo(() => calculateFinalTime(rawTime, penaltySeconds), [penaltySeconds, rawTime]);

  function log(category: string, message: string, severity: "info" | "success" | "warning" | "danger" = "info") {
    addEventLog({ time: nowLabel(), category, message, severity });
  }

  function handleSetActive() {
    if (!selectedEventId) return;
    setActiveEvent(selectedEventId);
    setWinnerPublished(false);
  }

  function setEventStatus(status: ManagedEvent["status"]) {
    if (!activeEvent) return;
    updateEventStatus(activeEvent.id, status);
  }

  function handleAddParticipant() {
    if (!activeEvent || !newParticipantDriverId) return;
    const driverId = availableParticipantDrivers.some((driver) => driver.id === newParticipantDriverId)
      ? newParticipantDriverId
      : availableParticipantDrivers[0]?.id;
    if (!driverId) return;
    addParticipant(activeEvent.id, driverId);
    const nextDriverId = availableParticipantDrivers.find((driver) => driver.id !== driverId)?.id ?? "";
    setNewParticipantDriverId(nextDriverId);
  }

  function confirmRemoveParticipant() {
    if (!participantToRemove) return;
    removeParticipant(participantToRemove, "Admin");
    setParticipantToRemove(null);
  }

  function setDriverFlag(driverId: string, flag: DriverFlag) {
    setDriverFlags((current) => ({ ...current, [driverId]: flag }));
    log("Deltager", `${getDriverName(driverId)} markeret som ${flag}.`, flag === "Klar" ? "info" : "warning");
  }

  function saveRpNote(driverId: string) {
    const note = rpNotes[driverId]?.trim();
    log("RP-note", `${getDriverName(driverId)}: ${note || "Ingen note skrevet."}`);
  }

  function loadResultForEdit(result: ResultScore) {
    setActiveTab("results");
    setEditingResultId(result.id);
    setSelectedDriverId(result.driverId);
    setResultMode(result.resultType ?? "score");
    setJudge(result.judge);
    setStyle(result.style);
    setAngle(result.angle);
    setSpeed(result.speed);
    setLine(result.line);
    setPenalty(result.penalty);
    setRawTime(result.time ?? 0);
    setPenaltySeconds(result.penaltySeconds ?? 0);
    setPlacement(result.placement ?? 1);
    setNotes(result.notes ?? "");
    setResultFeedback(`Redigerer resultat ${result.id}. Gem ændringer opdaterer samme resultat.`);
  }

  function clearResultForm() {
    setEditingResultId(null);
    setNotes("");
  }

  function createResult(status: "pending" | "approved") {
    if (!activeEvent || !resultDriverId || !canRegisterResult) {
      setResultFeedback("Tilføj deltagere til eventet, før du kan registrere resultater.");
      return;
    }

    const id = editingResultId ?? `${resultMode === "time" ? "RT" : resultMode === "placement" ? "RP" : "RS"}-${Date.now()}`;
    const placementScore = Math.max(1000 - placement, 0);
    const result: ResultScore = {
      id,
      eventId: activeEvent.id,
      driverId: resultDriverId,
      heatId: "manual-entry",
      runNumber: 1,
      judge,
      style: resultMode === "score" ? style : 0,
      speed: resultMode === "score" ? speed : 0,
      angle: resultMode === "score" ? angle : 0,
      line: resultMode === "score" ? line : 0,
      penalty: resultMode === "score" ? penalty : 0,
      total: resultMode === "score" ? totalScore : resultMode === "placement" ? placementScore : 0,
      time: resultMode === "time" ? rawTime : undefined,
      penaltySeconds: resultMode === "time" ? penaltySeconds : undefined,
      finalTime: resultMode === "time" ? finalTime : undefined,
      placement: resultMode === "placement" ? placement : undefined,
      notes,
      resultType: resultMode,
      status,
      createdAt: new Date().toISOString(),
    };

    if (editingResultId) {
      updateResult(id, result);
    } else {
      addResult(result);
      if (status === "approved") approveResult(id);
    }

    setResultFeedback(
      editingResultId
        ? "Ændringerne er gemt på samme resultat. Der er ikke oprettet en dublet."
        : status === "approved"
          ? "Resultatet er godkendt og vises nu på live ranglisten."
          : "Resultatet er gemt som afventende."
    );
    clearResultForm();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createResult("pending");
  }

  function publishWinners() {
    if (!activeEvent || winnersPreview.length === 0) return;

    winnersPreview.forEach((entry, index) => {
      publishHallOfFameWinner({
        id: `HOF-${activeEvent.id}-${index + 1}`,
        eventId: activeEvent.id,
        driverId: entry.driverId,
        placement: (index + 1) as 1 | 2 | 3,
        publishedBy: "DarkLight Staff",
        publishedAt: new Date().toISOString(),
        notes: "Publiceret manuelt fra Eventkontrol.",
      });
    });
    setWinnerPublished(true);
    setWorkspaceMessage("Vinderne er offentliggjort i Hall of Fame.");
  }

  function approveAllPendingResults() {
    pendingResults.forEach((result) => approveResult(result.id));
    if (pendingResults.length > 0) {
      setWorkspaceMessage(`${pendingResults.length} afventende resultater er godkendt og vises nu på ranglisten.`);
    } else {
      setWorkspaceMessage("Der er ingen afventende resultater at godkende.");
    }
  }

  function archiveEvent() {
    setEventStatus("Archived");
    setWorkspaceMessage("Eventet er arkiveret.");
  }

  function createWorkspaceLog(category: string, message: string) {
    log(category, message, "success");
    setWorkspaceMessage(message);
  }

  function runEventReset() {
    if (!activeEvent || !resetScope || resetConfirm.trim().toUpperCase() !== "NULSTIL") return;
    resetSingleEventData(activeEvent.id, resetScope, "DarkLight staff");
    setWorkspaceMessage(`${activeEvent.title} er nulstillet for: ${resetScope}.`);
    setResetScope(null);
    setResetConfirm("");
  }

  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <main className="min-h-screen bg-black px-5 pb-8 text-white lg:px-8">
          <div className="mx-auto max-w-[1500px]">
            <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-black uppercase tracking-[0.4em] text-zinc-500">EventOS v2</p>
                    <button
                      type="button"
                      onClick={() => setHelpOpen(true)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black text-sm font-black text-zinc-300 transition hover:bg-white hover:text-black"
                      aria-label="Åbn hjælp"
                    >
                      ?
                    </button>
                  </div>
                  <h1 className="mt-3 text-4xl font-black md:text-6xl">Eventkontrol</h1>
                  <p className="mt-4 max-w-3xl leading-7 text-zinc-400">
                    Samlet workspace til ét event ad gangen: deltagere, resultater, rangliste, vindere, historik, galleri, sponsorer og tilladelser.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <QuickAction label="Tilføj deltager" onClick={() => setActiveTab("participants")} />
                  <QuickAction label="Indtast resultat" onClick={() => setActiveTab("results")} />
                  <QuickAction label="Godkend resultater" onClick={approveAllPendingResults} />
                  <QuickAction label="Offentliggør vindere" onClick={() => setActiveTab("winners")} />
                  <QuickAction label="Tilføj tilladelse" onClick={() => setActiveTab("permissions")} />
                  <QuickAction label="Tilføj sponsor" onClick={() => setActiveTab("sponsors")} />
                  <QuickAction label="Upload galleri" onClick={() => setActiveTab("gallery")} />
                  <QuickAction label="Arkiver event" onClick={archiveEvent} />
                </div>
              </div>

              {workspaceMessage ? (
                <p className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm font-black text-green-300">
                  {workspaceMessage}
                </p>
              ) : null}

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <TopStat label="Eventnavn" value={activeEvent?.title ?? "Vælg event"} />
                <TopStat label="Status" value={activeEvent?.status ?? "-"} />
                <TopStat label="Dato" value={activeEvent ? `${activeEvent.date} kl. ${activeEvent.time}` : "-"} />
                <TopStat label="Lokation" value={activeEvent?.location ?? "-"} />
                <TopStat label="Eventtype" value={activeEvent?.type ?? "-"} />
                <TopStat label="Ansvarlig" value="DarkLight staff" />
                <TopStat label="Deltagere" value={eventParticipants.length} />
                <TopStat label="Godkendte" value={approvedResults.length} />
                <TopStat label="Afventer" value={pendingResults.length} />
                <TopStat label="Offentliggjort" value={eventWinners.length > 0 ? "Ja" : "Nej"} />
              </div>
            </header>

            <div className="mb-6">
              <div className="hidden flex-wrap gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-2 md:flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-w-[135px] flex-1 rounded-2xl px-4 py-3 text-sm font-black transition ${
                      activeTab === tab.id ? "bg-white text-black" : "text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <select
                value={activeTab}
                onChange={(event) => setActiveTab(event.target.value as DashboardTab)}
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 font-black text-white md:hidden"
              >
                {tabs.map((tab) => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
              </select>
            </div>

            {activeTab === "overview" ? (
              <OverviewTab
                activeEvent={activeEvent}
                eventParticipants={eventParticipants.length}
                checkedInCount={checkedInCount}
                pendingCount={pendingResults.length}
                approvedCount={approvedResults.length}
                rejectedCount={rejectedResults.length}
                winnerCount={eventWinners.length}
                winnersPreview={winnersPreview}
                logs={logs}
                eventStats={eventStats}
                onOpenWinners={() => setActiveTab("winners")}
                onOpenParticipants={() => setActiveTab("participants")}
                onOpenResults={() => setActiveTab("results")}
                events={events}
                selectedEventId={selectedEventId}
                setSelectedEventId={setSelectedEventId}
                handleSetActive={handleSetActive}
                setEventStatus={setEventStatus}
              />
            ) : null}

            {activeTab === "participants" ? (
              <ParticipantsTab
                activeEvent={activeEvent}
                eventParticipants={eventParticipants}
                allDrivers={allDrivers}
                availableParticipantDrivers={availableParticipantDrivers}
                newParticipantDriverId={newParticipantDriverId}
                setNewParticipantDriverId={setNewParticipantDriverId}
                handleAddParticipant={handleAddParticipant}
                driverFlags={driverFlags}
                rpNotes={rpNotes}
                setRpNotes={setRpNotes}
                setParticipantCheckIn={setParticipantCheckIn}
                setDriverFlag={setDriverFlag}
                saveRpNote={saveRpNote}
                participantToRemove={participantToRemove}
                setParticipantToRemove={setParticipantToRemove}
                confirmRemoveParticipant={confirmRemoveParticipant}
              />
            ) : null}

            {activeTab === "results" ? (
              <ResultsTab
                activeEvent={activeEvent}
                events={events}
                selectedEventId={selectedEventId}
                setSelectedEventId={setSelectedEventId}
                setActiveEvent={setActiveEvent}
                selectedDriverId={selectedDriverId}
                resultDriverId={resultDriverId}
                setSelectedDriverId={setSelectedDriverId}
                activeEventDrivers={activeEventDrivers}
                selectedDriverIsParticipant={selectedDriverIsParticipant}
                resultMode={resultMode}
                setResultMode={setResultMode}
                judge={judge}
                setJudge={setJudge}
                style={style}
                setStyle={setStyle}
                angle={angle}
                setAngle={setAngle}
                speed={speed}
                setSpeed={setSpeed}
                line={line}
                setLine={setLine}
                penalty={penalty}
                setPenalty={setPenalty}
                rawTime={rawTime}
                setRawTime={setRawTime}
                penaltySeconds={penaltySeconds}
                setPenaltySeconds={setPenaltySeconds}
                placement={placement}
                setPlacement={setPlacement}
                notes={notes}
                setNotes={setNotes}
                totalScore={totalScore}
                finalTime={finalTime}
                canRegisterResult={canRegisterResult}
                resultFeedback={resultFeedback}
                editingResultId={editingResultId}
                setEditingResultId={setEditingResultId}
                setResultFeedback={setResultFeedback}
                handleSubmit={handleSubmit}
                createResult={createResult}
                pendingResults={pendingResults}
                approvedResults={approvedResults}
                rejectedResults={rejectedResults}
                loadResultForEdit={loadResultForEdit}
                approveResult={approveResult}
                rejectResult={rejectResult}
                deleteResult={deleteResult}
              />
            ) : null}

            {activeTab === "leaderboard" ? (
              <LeaderboardTab
                leaderboardFilter={leaderboardFilter}
                setLeaderboardFilter={setLeaderboardFilter}
                filteredLeaderboard={filteredLeaderboard}
                log={log}
              />
            ) : null}

            {activeTab === "winners" ? (
              <WinnersTab
                winnersPreview={winnersPreview}
                winnerPublished={winnerPublished}
                publishWinners={publishWinners}
                hallOfFameWinners={hallOfFameWinners}
              />
            ) : null}

            {activeTab === "history" ? (
              <HistoryTab
                logs={logs}
                eventResults={eventResults}
                resetScope={resetScope}
                setResetScope={setResetScope}
                resetConfirm={resetConfirm}
                setResetConfirm={setResetConfirm}
                runEventReset={runEventReset}
              />
            ) : null}

            {activeTab === "gallery" ? (
              <GalleryTab activeEvent={activeEvent} createWorkspaceLog={createWorkspaceLog} />
            ) : null}

            {activeTab === "sponsors" ? (
              <SponsorsTab activeEvent={activeEvent} createWorkspaceLog={createWorkspaceLog} />
            ) : null}

            {activeTab === "permissions" ? (
              <PermissionsTab activeEvent={activeEvent} createWorkspaceLog={createWorkspaceLog} />
            ) : null}
          </div>
        </main>
      </CompetitionLayout>
      <Footer />
      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

function OverviewTab({
  activeEvent,
  eventParticipants,
  checkedInCount,
  pendingCount,
  approvedCount,
  rejectedCount,
  winnerCount,
  winnersPreview,
  logs,
  eventStats,
  onOpenWinners,
  onOpenParticipants,
  onOpenResults,
  events,
  selectedEventId,
  setSelectedEventId,
  handleSetActive,
  setEventStatus,
}: {
  activeEvent?: ManagedEvent;
  eventParticipants: number;
  checkedInCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  winnerCount: number;
  winnersPreview: ReturnType<typeof getLiveLeaderboardRows>;
  logs: Array<{ id: string; time: string; category: string; message: string }>;
  eventStats?: ReturnType<typeof getEventStats>;
  onOpenWinners: () => void;
  onOpenParticipants: () => void;
  onOpenResults: () => void;
  events: ManagedEvent[];
  selectedEventId: string;
  setSelectedEventId: (value: string) => void;
  handleSetActive: () => void;
  setEventStatus: (status: ManagedEvent["status"]) => void;
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TopStat label="Aktivt event" value={activeEvent?.title ?? "Vælg event"} />
        <TopStat label="Deltagere" value={eventParticipants} />
        <TopStat label="Checket ind" value={checkedInCount} />
        <TopStat label="Afventer resultater" value={pendingCount} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <AdminChecklist
          activeEvent={activeEvent}
          eventParticipants={eventParticipants}
          checkedInCount={checkedInCount}
          pendingCount={pendingCount}
          approvedCount={approvedCount}
          winnerCount={winnerCount}
        />
        <EventHealth
          eventParticipants={eventParticipants}
          pendingCount={pendingCount}
          approvedCount={approvedCount}
          rejectedCount={rejectedCount}
          winnerCount={winnerCount}
          eventStats={eventStats}
          onOpenParticipants={onOpenParticipants}
          onOpenResults={onOpenResults}
          onOpenWinners={onOpenWinners}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Panel step="Dashboard" title="Oversigt">
          <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <Select label="Aktivt event" value={selectedEventId} onChange={setSelectedEventId}>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </Select>
            <button type="button" onClick={handleSetActive} className="rounded-2xl bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">
              Sæt som aktivt
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black p-4">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Status</p>
              <div className="mt-3"><StatusBadge status={activeEvent?.status ?? "Ready"} /></div>
            </div>
            <Readout label="Godkendte resultater" value={approvedCount} />
            <Readout label="Dato" value={activeEvent ? `${activeEvent.date} kl. ${activeEvent.time}` : "-"} />
            <Readout label="Lokation" value={activeEvent?.location ?? "-"} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => setEventStatus("Live")} className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
              Start event
            </button>
            <button type="button" onClick={() => setEventStatus("Paused")} className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
              Pause event
            </button>
            <button type="button" onClick={() => setEventStatus("Finished")} className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200 transition hover:bg-red-500 hover:text-white">
              Afslut event
            </button>
          </div>
        </Panel>

        <Panel step="Top 3" title="Preview">
          <div className="grid gap-3">
            {winnersPreview.length > 0 ? winnersPreview.map((entry) => (
              <MiniRow key={entry.id} left={`#${entry.position} ${getDriverName(entry.driverId)}`} right={resultValue(entry)} />
            )) : <EmptyState title="Ingen top 3 endnu" text="Godkend resultater for at danne preview." />}
          </div>
          <button type="button" onClick={onOpenWinners} className="mt-5 rounded-full border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
            Åbn vindere
          </button>
        </Panel>
      </div>

      <Panel step="Seneste aktivitet" title="Historik">
        <LogList logs={logs.slice(0, 5)} />
      </Panel>
    </div>
  );
}

function AdminChecklist({
  activeEvent,
  eventParticipants,
  checkedInCount,
  pendingCount,
  approvedCount,
  winnerCount,
}: {
  activeEvent?: ManagedEvent;
  eventParticipants: number;
  checkedInCount: number;
  pendingCount: number;
  approvedCount: number;
  winnerCount: number;
}) {
  const checklist = [
    { label: "Event oprettet", done: Boolean(activeEvent), help: "Vælg eller opret et event før workflowet starter." },
    { label: "Deltagere registreret", done: eventParticipants > 0, help: "Tilføj mindst én deltager før der kan registreres resultater." },
    { label: "Check-in færdig", done: eventParticipants > 0 && checkedInCount === eventParticipants, help: "Check alle fremmødte deltagere ind." },
    { label: "Resultater indtastet", done: pendingCount + approvedCount > 0, help: "Indtast point, tid eller placering efter eventet." },
    { label: "Resultater godkendt", done: approvedCount > 0 && pendingCount === 0, help: "Godkend resultater for at opdatere ranglisten." },
    { label: "Rangliste opdateret", done: approvedCount > 0, help: "Ranglisten opdateres automatisk fra godkendte resultater." },
    { label: "Vindere offentliggjort", done: winnerCount > 0, help: "Du kan ikke offentliggøre vindere før resultaterne er godkendt." },
    { label: "Event arkiveret", done: activeEvent?.status === "Archived", help: "Arkiver eventet når alt er færdigt." },
  ];

  return (
    <Panel step="Admin checklist" title="Event workflow">
      <div className="grid gap-3">
        {checklist.map((item) => (
          <div key={item.label} className={`rounded-2xl border p-4 ${item.done ? "border-green-400/20 bg-green-400/10" : "border-yellow-400/20 bg-yellow-400/10"}`}>
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${item.done ? "bg-green-400 text-black" : "bg-yellow-400 text-black"}`}>
                {item.done ? "✓" : "!"}
              </span>
              <div>
                <p className="font-black">{item.label}</p>
                {!item.done ? <p className="mt-1 text-sm leading-6 text-zinc-400">{item.help}</p> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function EventHealth({
  eventParticipants,
  pendingCount,
  approvedCount,
  rejectedCount,
  winnerCount,
  eventStats,
  onOpenParticipants,
  onOpenResults,
  onOpenWinners,
}: {
  eventParticipants: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  winnerCount: number;
  eventStats?: ReturnType<typeof getEventStats>;
  onOpenParticipants: () => void;
  onOpenResults: () => void;
  onOpenWinners: () => void;
}) {
  const items = [
    { label: eventParticipants > 0 ? "Event klar" : "Mangler deltagere", state: eventParticipants > 0 ? "green" : "yellow", action: onOpenParticipants },
    { label: approvedCount + pendingCount > 0 ? "Resultater registreret" : "Mangler resultater", state: approvedCount + pendingCount > 0 ? "green" : "yellow", action: onOpenResults },
    { label: approvedCount > 0 ? "Rangliste opdateret" : "Rangliste afventer", state: approvedCount > 0 ? "green" : "yellow", action: onOpenResults },
    { label: winnerCount > 0 ? "Vindere offentliggjort" : "Vindere ikke offentliggjort", state: winnerCount > 0 ? "green" : "red", action: onOpenWinners },
  ];

  return (
    <Panel step="Event health" title="Systemstatus">
      <div className="grid gap-3">
        {items.map((item) => (
          <button key={item.label} type="button" onClick={item.action} className="rounded-2xl border border-white/10 bg-black p-4 text-left transition hover:border-white/30 hover:bg-white/[0.04]">
            <span className="font-black">{item.state === "green" ? "🟢" : item.state === "yellow" ? "🟡" : "🔴"} {item.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Readout label="Afviste" value={rejectedCount} />
        <Readout label="Top 3 klar" value={eventStats?.topThree.length ?? 0} />
      </div>
    </Panel>
  );
}

function ParticipantsTab({
  activeEvent,
  eventParticipants,
  allDrivers,
  availableParticipantDrivers,
  newParticipantDriverId,
  setNewParticipantDriverId,
  handleAddParticipant,
  driverFlags,
  rpNotes,
  setRpNotes,
  setParticipantCheckIn,
  setDriverFlag,
  saveRpNote,
  participantToRemove,
  setParticipantToRemove,
  confirmRemoveParticipant,
}: {
  activeEvent?: ManagedEvent;
  eventParticipants: Array<{ id: string; driverId: string; checkedIn: boolean }>;
  allDrivers: typeof drivers;
  availableParticipantDrivers: typeof drivers;
  newParticipantDriverId: string;
  setNewParticipantDriverId: (value: string) => void;
  handleAddParticipant: () => void;
  driverFlags: Record<string, DriverFlag>;
  rpNotes: Record<string, string>;
  setRpNotes: (value: Record<string, string> | ((current: Record<string, string>) => Record<string, string>)) => void;
  setParticipantCheckIn: (participantId: string, checkedIn: boolean) => void;
  setDriverFlag: (driverId: string, flag: DriverFlag) => void;
  saveRpNote: (driverId: string) => void;
  participantToRemove: string | null;
  setParticipantToRemove: (value: string | null) => void;
  confirmRemoveParticipant: () => void;
}) {
  return (
    <Panel step="Deltagere" title="Tilmelding og check-in">
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <Select label="Tilføj deltager manuelt" value={newParticipantDriverId} onChange={setNewParticipantDriverId}>
          {availableParticipantDrivers.length > 0 ? (
            availableParticipantDrivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name} · {driver.darklightId}</option>)
          ) : (
            <option value="">Alle kendte kørere er tilmeldt</option>
          )}
        </Select>
        <button type="button" disabled={!newParticipantDriverId || availableParticipantDrivers.length === 0} onClick={handleAddParticipant} className="rounded-2xl bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-40">
          Tilføj deltager
        </button>
      </div>

      <div className="grid gap-3">
        {eventParticipants.length > 0 ? eventParticipants.map((participant) => {
          const driver = allDrivers.find((item) => item.id === participant.driverId);
          const flag = driverFlags[participant.driverId] ?? "Klar";

          return (
            <article key={participant.id} className="rounded-2xl border border-white/10 bg-black p-4">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-black">{driver?.name ?? participant.driverId}</h3>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-zinc-300">{flag}</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-zinc-300">
                      {participant.checkedIn ? "Checket ind" : "Ikke checket ind"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">{driver?.favoriteVehicle ?? "Bil ikke valgt"} · {driver?.role ?? "Rolle afventer"} · {activeEvent?.title ?? "Event"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SmallButton tooltip={participant.checkedIn ? "Fjerner deltagerens check-in markering." : "Marker deltageren som mødt op til eventet."} onClick={() => setParticipantCheckIn(participant.id, !participant.checkedIn)}>
                    {participant.checkedIn ? "Fjern check-in" : "Check ind"}
                  </SmallButton>
                  <SmallButton tooltip="Did Not Finish - deltageren startede, men gennemførte ikke." onClick={() => setDriverFlag(participant.driverId, "DNF")}>DNF</SmallButton>
                  <SmallButton tooltip="Did Not Start - deltageren var tilmeldt, men startede ikke." onClick={() => setDriverFlag(participant.driverId, "DNS")}>DNS</SmallButton>
                  <SmallButton tooltip="Marker deltageren som diskvalificeret fra eventet." danger onClick={() => setDriverFlag(participant.driverId, "Diskvalificeret")}>Diskvalificer</SmallButton>
                  <SmallButton tooltip="Fjerner deltageren fra eventet. Driverprofilen slettes ikke." danger onClick={() => setParticipantToRemove(participant.id)}>Fjern</SmallButton>
                </div>
              </div>

              {participantToRemove === participant.id ? (
                <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="font-black text-red-100">Fjern deltager fra event?</p>
                  <p className="mt-2 text-sm leading-6 text-red-100/80">
                    Dette fjerner kun deltageren fra eventet. Driverprofilen slettes ikke, og historiske godkendte resultater bevares.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={confirmRemoveParticipant} className="rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white transition hover:bg-red-400">
                      Bekræft fjern
                    </button>
                    <button type="button" onClick={() => setParticipantToRemove(null)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                      Annuller
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
                <input
                  value={rpNotes[participant.driverId] ?? ""}
                  onChange={(event) => setRpNotes((current) => ({ ...current, [participant.driverId]: event.target.value }))}
                  placeholder="RP-note"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
                />
                <SmallButton tooltip="Tilføj en intern note til deltageren eller eventet." onClick={() => saveRpNote(participant.driverId)}>Gem note</SmallButton>
              </div>
            </article>
          );
        }) : (
          <EmptyState title="Ingen deltagere endnu" text="Tilføj deltagere manuelt, når de er klar til eventet." />
        )}
      </div>
    </Panel>
  );
}

function ResultsTab(props: {
  activeEvent?: ManagedEvent;
  events: ManagedEvent[];
  selectedEventId: string;
  setSelectedEventId: (value: string) => void;
  setActiveEvent: (value: string) => void;
  selectedDriverId: string;
  resultDriverId: string;
  setSelectedDriverId: (value: string) => void;
  activeEventDrivers: typeof drivers;
  selectedDriverIsParticipant: boolean;
  resultMode: ResultMode;
  setResultMode: (value: ResultMode) => void;
  judge: string;
  setJudge: (value: string) => void;
  style: number;
  setStyle: (value: number) => void;
  angle: number;
  setAngle: (value: number) => void;
  speed: number;
  setSpeed: (value: number) => void;
  line: number;
  setLine: (value: number) => void;
  penalty: number;
  setPenalty: (value: number) => void;
  rawTime: number;
  setRawTime: (value: number) => void;
  penaltySeconds: number;
  setPenaltySeconds: (value: number) => void;
  placement: number;
  setPlacement: (value: number) => void;
  notes: string;
  setNotes: (value: string) => void;
  totalScore: number;
  finalTime: number;
  canRegisterResult: boolean;
  resultFeedback: string;
  editingResultId: string | null;
  setEditingResultId: (value: string | null) => void;
  setResultFeedback: (value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  createResult: (status: "pending" | "approved") => void;
  pendingResults: ResultScore[];
  approvedResults: ResultScore[];
  rejectedResults: ResultScore[];
  loadResultForEdit: (result: ResultScore) => void;
  approveResult: (id: string) => void;
  rejectResult: (id: string) => void;
  deleteResult: (id: string) => void;
}) {
  const groupedResults = [
    { title: "Afventende", items: props.pendingResults },
    { title: "Godkendte", items: props.approvedResults },
    { title: "Afviste", items: props.rejectedResults },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Panel step="Resultater" title="Registrering">
        <form onSubmit={props.handleSubmit} className="grid gap-5">
          {props.editingResultId ? (
            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm font-black text-yellow-200">
              Redigerer resultat {props.editingResultId}. Gem ændringer opdaterer samme resultat-id.
            </div>
          ) : null}

          {props.resultFeedback ? (
            <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-sm font-black text-green-300">
              {props.resultFeedback}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Event" value={props.activeEvent?.id ?? props.selectedEventId} onChange={(value) => { props.setSelectedEventId(value); props.setActiveEvent(value); }}>
              {props.events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
            </Select>
            <Select label="Deltager" value={props.resultDriverId} onChange={props.setSelectedDriverId} disabled={props.activeEventDrivers.length === 0}>
              {props.activeEventDrivers.length > 0 ? (
                props.activeEventDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>{driver.name} · {driver.darklightId}</option>
                ))
              ) : (
                <option value="">Ingen tilmeldte deltagere</option>
              )}
            </Select>
          </div>

          {props.activeEventDrivers.length === 0 ? (
            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm font-black text-yellow-200">
              Tilføj deltagere til eventet, før du kan registrere resultater.
            </div>
          ) : null}

          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Resultattype</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(["score", "time", "placement"] as ResultMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => props.setResultMode(mode)}
                  className={`rounded-2xl border px-4 py-3 font-black transition ${
                    props.resultMode === mode ? "border-white bg-white text-black" : "border-white/10 bg-black text-zinc-300 hover:border-white/30"
                  }`}
                >
                  {resultLabels[mode]}
                </button>
              ))}
            </div>
          </div>

          {props.resultMode === "score" ? (
            <>
              <HelpBox title="Point-event">Indtast dommerens vurdering. Systemet beregner totalen efter strafpoint.</HelpBox>
              <Input label="Dommer" value={props.judge} onChange={props.setJudge} />
              <div className="grid gap-4 md:grid-cols-3">
                <NumberInput label="Style" value={props.style} onChange={props.setStyle} />
                <NumberInput label="Angle" value={props.angle} onChange={props.setAngle} />
                <NumberInput label="Speed" value={props.speed} onChange={props.setSpeed} />
                <NumberInput label="Line" value={props.line} onChange={props.setLine} />
                <NumberInput label="Straf" value={props.penalty} onChange={props.setPenalty} />
                <Readout label="Total" value={props.totalScore} />
              </div>
            </>
          ) : null}

          {props.resultMode === "time" ? (
            <>
              <HelpBox title="Tidsevent">Tider tages fra racing tablet ingame. Indtast tiden her efter løbet.</HelpBox>
              <div className="grid gap-4 md:grid-cols-3">
                <NumberInput label="Tid fra racing tablet" value={props.rawTime} onChange={props.setRawTime} step="0.001" />
                <NumberInput label="Strafsekunder" value={props.penaltySeconds} onChange={props.setPenaltySeconds} step="0.001" />
                <Readout label="Final tid" value={formatTime(props.finalTime)} />
              </div>
            </>
          ) : null}

          {props.resultMode === "placement" ? (
            <>
              <HelpBox title="Placering">Brug placering, når eventet registreres efter samlet finish. Laveste placering rangerer bedst.</HelpBox>
              <NumberInput label="Placering" value={props.placement} onChange={props.setPlacement} min={1} />
            </>
          ) : null}

          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Noter</span>
            <textarea
              value={props.notes}
              onChange={(event) => props.setNotes(event.target.value)}
              placeholder="Kort dommernote eller eventnote"
              className="min-h-28 rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <Tooltip text={props.editingResultId ? "Gemmer ændringer på samme resultat-id." : "Gemmer resultatet som afventende."}>
              <button type="submit" disabled={!props.canRegisterResult} className="rounded-full border border-white bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-40">
                {props.editingResultId ? "Gem ændringer" : "Gem resultat"}
              </button>
            </Tooltip>
            <Tooltip text="Godkender resultatet og viser det på live ranglisten.">
              <button type="button" disabled={!props.canRegisterResult} onClick={() => props.createResult("approved")} className="rounded-full border border-white/10 bg-black px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40">
                {props.editingResultId ? "Gem og godkend" : "Godkend resultat"}
              </button>
            </Tooltip>
            {props.editingResultId ? (
              <button type="button" onClick={() => { props.setEditingResultId(null); props.setResultFeedback(""); }} className="rounded-full border border-white/10 bg-black px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                Annuller
              </button>
            ) : null}
          </div>
        </form>
      </Panel>

      <div className="grid gap-6">
        {groupedResults.map((group) => (
          <Panel key={group.title} step="Resultatlog" title={group.title}>
            <div className="grid gap-3">
              {group.items.length > 0 ? group.items.map((result) => (
                <ResultManagerRow
                  key={result.id}
                  result={result}
                  loadResultForEdit={props.loadResultForEdit}
                  approveResult={props.approveResult}
                  rejectResult={props.rejectResult}
                  deleteResult={props.deleteResult}
                />
              )) : (
                <EmptyState title={`Ingen ${group.title.toLowerCase()} resultater`} text="Resultater vises her, når de oprettes." />
              )}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function ResultManagerRow({
  result,
  loadResultForEdit,
  approveResult,
  rejectResult,
  deleteResult,
}: {
  result: ResultScore;
  loadResultForEdit: (result: ResultScore) => void;
  approveResult: (id: string) => void;
  rejectResult: (id: string) => void;
  deleteResult: (id: string) => void;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black p-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h3 className="font-black">{getDriverName(result.driverId)}</h3>
          <p className="mt-1 text-sm text-zinc-500">{resultLabels[(result.resultType ?? "score") as ResultMode]} · {result.id} · {result.status}</p>
          {result.notes ? <p className="mt-2 text-sm text-zinc-400">{result.notes}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <SmallButton tooltip="Åbner resultatet i formularen, så samme resultat-id kan redigeres." onClick={() => loadResultForEdit(result)}>Rediger</SmallButton>
          <SmallButton tooltip="Godkender resultatet og viser det på live ranglisten." onClick={() => approveResult(result.id)}>Godkend</SmallButton>
          <SmallButton tooltip="Afviser resultatet, så det ikke tæller med." danger onClick={() => rejectResult(result.id)}>Afvis</SmallButton>
          <SmallButton tooltip="Sletter resultatlinjen. Driverprofilen slettes ikke." danger onClick={() => deleteResult(result.id)}>Slet</SmallButton>
        </div>
      </div>
    </article>
  );
}

function LeaderboardTab({
  leaderboardFilter,
  setLeaderboardFilter,
  filteredLeaderboard,
  log,
}: {
  leaderboardFilter: "all" | ResultMode;
  setLeaderboardFilter: (value: "all" | ResultMode) => void;
  filteredLeaderboard: ReturnType<typeof getLiveLeaderboardRows>;
  log: (category: string, message: string, severity?: "info" | "success" | "warning" | "danger") => void;
}) {
  return (
    <div className="grid gap-6">
      <Panel step="Rangliste" title="Live Rangliste">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            {(["all", "score", "time", "placement"] as Array<"all" | ResultMode>).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setLeaderboardFilter(filter)}
                className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                  leaderboardFilter === filter ? "border-white bg-white text-black" : "border-white/10 bg-black text-zinc-300 hover:bg-white hover:text-black"
                }`}
              >
                {filter === "all" ? "Alle" : resultLabels[filter]}
              </button>
            ))}
          </div>
          <Tooltip text="Eksport er forberedt som manuel EventOS-handling.">
            <button
              type="button"
              onClick={() => log("Eksport", "Ranglisteeksport blev klargjort af staff.", "info")}
              className="rounded-full border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black"
            >
              Eksport
            </button>
          </Tooltip>
        </div>

        <div className="grid gap-3">
          {filteredLeaderboard.length > 0 ? filteredLeaderboard.map((entry) => (
            <div key={entry.id} className="grid gap-4 rounded-2xl border border-white/10 bg-black p-5 md:grid-cols-[80px_1fr_140px_140px] md:items-center">
              <p className="text-2xl font-black">#{entry.position}</p>
              <div>
                <h3 className="font-black">{getDriverName(entry.driverId)}</h3>
                <p className="text-sm text-zinc-500">{entry.eventId}</p>
              </div>
              <p className="rounded-full border border-white/10 px-4 py-2 text-center text-sm font-black text-zinc-300">{resultLabels[entry.resultType]}</p>
              <p className="font-black">{resultValue(entry)}</p>
            </div>
          )) : (
            <EmptyState title="Ranglisten er tom" text="Ranglisten opdateres, når de første resultater er godkendt." />
          )}
        </div>
      </Panel>

      <LiveLeaderboard title="Samlet live rangliste" description="Kun godkendte resultater vises her. Sortering sker efter resultattype." showPublicLink />
    </div>
  );
}

function WinnersTab({
  winnersPreview,
  winnerPublished,
  publishWinners,
  hallOfFameWinners,
}: {
  winnersPreview: ReturnType<typeof getLiveLeaderboardRows>;
  winnerPublished: boolean;
  publishWinners: () => void;
  hallOfFameWinners: Array<{ id: string; driverId: string; eventId: string; placement: number }>;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Panel step="Vindere" title="Top 3 preview">
        <div className="grid gap-3">
          {winnersPreview.length > 0 ? winnersPreview.map((entry) => (
            <MiniRow key={entry.id} left={`#${entry.position} ${getDriverName(entry.driverId)}`} right={resultValue(entry)} />
          )) : (
            <EmptyState title="Ingen vindere endnu" text="Godkend resultater for at danne top 3 preview." />
          )}
        </div>
        <Tooltip text="Opdaterer Hall of Fame med eventets topplaceringer.">
          <button
            type="button"
            disabled={winnersPreview.length === 0}
            onClick={publishWinners}
            className="mt-5 w-full rounded-full border border-white bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {winnerPublished ? "Vindere offentliggjort" : "Offentliggør vindere"}
          </button>
        </Tooltip>
      </Panel>

      <Panel step="Hall of Fame" title="Preview">
        <div className="grid gap-3">
          {hallOfFameWinners.length > 0 ? hallOfFameWinners.map((winner) => (
            <MiniRow key={winner.id} left={`P${winner.placement} ${getDriverName(winner.driverId)}`} right={winner.eventId} />
          )) : (
            <EmptyState title="Hall of Fame er tom" text="Vindere vises først, når staff offentliggør dem." />
          )}
        </div>
      </Panel>
    </div>
  );
}

function HistoryTab({
  logs,
  eventResults,
  resetScope,
  setResetScope,
  resetConfirm,
  setResetConfirm,
  runEventReset,
}: {
  logs: Array<{ id: string; time: string; category: string; message: string }>;
  eventResults: ResultScore[];
  resetScope: EventResetScope | null;
  setResetScope: (value: EventResetScope | null) => void;
  resetConfirm: string;
  setResetConfirm: (value: string) => void;
  runEventReset: () => void;
}) {
  const resetActions: Array<{ scope: EventResetScope; title: string; text: string }> = [
    { scope: "participants", title: "Nulstil deltagere", text: "Fjerner deltagere og check-ins fra dette event." },
    { scope: "results", title: "Nulstil resultater", text: "Fjerner pending, godkendte og afviste resultater for dette event." },
    { scope: "leaderboard", title: "Nulstil rangliste", text: "Fjerner eventets resultater fra live ranglisten." },
    { scope: "winners", title: "Nulstil vindere", text: "Fjerner offentliggjorte vindere for dette event." },
    { scope: "history", title: "Nulstil historik", text: "Rydder historikvisningen og gemmer reset-linje." },
    { scope: "all", title: "Nulstil hele eventet", text: "Rydder deltagere, resultater, vindere, heats og historik." },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel step="Aktivitetslog" title="Aktivitet">
          <LogList logs={logs.slice(0, 16)} />
        </Panel>
        <Panel step="Resultatlog" title="Resultater">
          <div className="grid gap-3">
            {eventResults.length > 0 ? eventResults.map((result) => (
              <MiniRow key={result.id} left={`${getDriverName(result.driverId)} · ${result.status}`} right={resultLabels[(result.resultType ?? "score") as ResultMode]} />
            )) : (
              <EmptyState title="Ingen resultathistorik" text="Resultater vises her, når de oprettes." />
            )}
          </div>
        </Panel>
        <Panel step="Adminlog" title="Admin">
          <LogList logs={logs.filter((log) => log.category.toLowerCase().includes("admin")).slice(0, 12)} />
        </Panel>
      </div>

      <Panel step="Nulstil event" title="Event reset">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {resetActions.map((action) => (
            <button key={action.scope} type="button" onClick={() => { setResetScope(action.scope); setResetConfirm(""); }} className="rounded-2xl border border-white/10 bg-black p-4 text-left transition hover:border-white/30 hover:bg-white/[0.04]">
              <span className="font-black">{action.title}</span>
              <span className="mt-2 block text-sm leading-6 text-zinc-500">{action.text}</span>
            </button>
          ))}
        </div>
        {resetScope ? (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="font-black text-red-100">Bekræft nulstilling</p>
            <p className="mt-2 text-sm leading-6 text-red-100/80">Skriv NULSTIL for at gennemføre. Driverprofiler slettes ikke.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <input value={resetConfirm} onChange={(event) => setResetConfirm(event.target.value)} placeholder="Skriv NULSTIL" className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white/40" />
              <button type="button" disabled={resetConfirm.trim().toUpperCase() !== "NULSTIL"} onClick={runEventReset} className="rounded-2xl bg-red-500 px-5 py-3 font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40">
                Bekræft
              </button>
              <button type="button" onClick={() => { setResetScope(null); setResetConfirm(""); }} className="rounded-2xl border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                Annuller
              </button>
            </div>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}

function GalleryTab({
  activeEvent,
  createWorkspaceLog,
}: {
  activeEvent?: ManagedEvent;
  createWorkspaceLog: (category: string, message: string) => void;
}) {
  return (
    <Panel step="Galleri" title="Eventgalleri">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-white/10 bg-black p-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Billeder</p>
          <h3 className="mt-3 text-3xl font-black">Der er endnu ikke uploadet billeder</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Galleri er klar til billeder fra {activeEvent?.title ?? "eventet"}. V2-galleri til public visning styres via PostgreSQL.
          </p>
        </div>
        <div className="grid gap-3">
          <Tooltip text="Tilføjer en intern loglinje om at galleri er klargjort.">
            <button type="button" onClick={() => createWorkspaceLog("Galleri", `Galleri er klargjort for ${activeEvent?.title ?? "eventet"}.`)} className="rounded-2xl bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">
              Upload galleri
            </button>
          </Tooltip>
          <HelpBox title="Galleri-flow">Billeder vises offentligt på eventdetaljen, når staff uploader eller registrerer dem.</HelpBox>
        </div>
      </div>
    </Panel>
  );
}

function SponsorsTab({
  activeEvent,
}: {
  activeEvent?: ManagedEvent;
  createWorkspaceLog?: (category: string, message: string) => void;
}) {
  const { eventSponsors, addSponsorToEvent, updateEventSponsor, removeSponsorFromEvent } = useEventOSStore();
  const sponsorsForEvent = eventSponsors.filter((sponsor) => sponsor.eventId === activeEvent?.id);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [removeSponsorId, setRemoveSponsorId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<EventSponsor, "id" | "eventId">>({
    name: "",
    level: "Partner",
    status: "Aktiv",
    logoInitials: "",
    logoUrl: "",
    description: "",
    supportedEvents: activeEvent?.title ?? "",
    contactPerson: "",
    notes: "",
  });
  const removingSponsor = sponsorsForEvent.find((sponsor) => sponsor.id === removeSponsorId);

  function openCreateForm() {
    setEditingSponsorId(null);
    setForm({
      name: "",
      level: "Partner",
      status: "Aktiv",
      logoInitials: "",
      logoUrl: "",
      description: "",
      supportedEvents: activeEvent?.title ?? "",
      contactPerson: "",
      notes: "",
    });
    setFormOpen(true);
  }

  function openEditForm(sponsor: EventSponsor) {
    setEditingSponsorId(sponsor.id);
    setForm({
      name: sponsor.name,
      level: sponsor.level,
      status: sponsor.status,
      logoInitials: sponsor.logoInitials,
      logoUrl: sponsor.logoUrl ?? "",
      description: sponsor.description,
      supportedEvents: sponsor.supportedEvents,
      contactPerson: sponsor.contactPerson,
      notes: sponsor.notes ?? "",
    });
    setFormOpen(true);
  }

  function updateForm<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submitSponsor() {
    if (!activeEvent || !form.name.trim()) return;
    const payload = {
      ...form,
      name: form.name.trim(),
      logoInitials: form.logoInitials.trim() || createInitials(form.name),
      supportedEvents: form.supportedEvents.trim() || activeEvent.title,
    };

    if (editingSponsorId) {
      updateEventSponsor(activeEvent.id, editingSponsorId, payload, "Admin");
    } else {
      addSponsorToEvent(activeEvent.id, payload, "Admin");
    }

    setFormOpen(false);
    setEditingSponsorId(null);
  }

  function confirmRemoveSponsor() {
    if (!activeEvent || !removeSponsorId) return;
    removeSponsorFromEvent(activeEvent.id, removeSponsorId, "Admin");
    setRemoveSponsorId(null);
  }

  return (
    <Panel step="Sponsorer" title="Event sponsorer">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <p className="max-w-3xl text-sm leading-6 text-zinc-400">
          Administrer sponsorer til {activeEvent?.title ?? "eventet"}. Disse vises på public eventdetaljen.
        </p>
        <button type="button" onClick={openCreateForm} className="rounded-2xl bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">
          Tilføj sponsor
        </button>
      </div>

      {formOpen ? (
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-black p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{editingSponsorId ? "Rediger sponsor" : "Ny sponsor"}</p>
              <h3 className="mt-2 text-2xl font-black">{editingSponsorId ? "Opdater sponsor" : "Tilføj sponsor"}</h3>
            </div>
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
              Luk
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Input label="Firmanavn" value={form.name} onChange={(value) => updateForm("name", value)} />
            <Select label="Sponsor niveau" value={form.level} onChange={(value) => updateForm("level", value as EventSponsor["level"])}>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Partner">Partner</option>
            </Select>
            <Select label="Status" value={form.status} onChange={(value) => updateForm("status", value as EventSponsor["status"])}>
              <option value="Aktiv">Aktiv</option>
              <option value="Afventer">Afventer</option>
              <option value="Deaktiveret">Deaktiveret</option>
            </Select>
            <Input label="Logo/initialer" value={form.logoInitials} onChange={(value) => updateForm("logoInitials", value)} />
            <Input label="Logo URL eller billede-sti" value={form.logoUrl ?? ""} onChange={(value) => updateForm("logoUrl", value)} />
            <Input label="RP kontaktperson" value={form.contactPerson} onChange={(value) => updateForm("contactPerson", value)} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Kort beskrivelse</span>
              <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} className="min-h-28 rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white" />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Hvilke events sponsoren støtter</span>
              <textarea value={form.supportedEvents} onChange={(event) => updateForm("supportedEvents", event.target.value)} className="min-h-28 rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white" />
            </label>
            <label className="grid gap-2 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Noter</span>
              <textarea value={form.notes ?? ""} onChange={(event) => updateForm("notes", event.target.value)} className="min-h-24 rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white" />
            </label>
          </div>

          <button type="button" onClick={submitSponsor} disabled={!form.name.trim()} className="mt-5 rounded-2xl bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-40">
            {editingSponsorId ? "Gem ændringer" : "Tilføj sponsor"}
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sponsorsForEvent.length > 0 ? sponsorsForEvent.map((sponsor) => (
          <article key={sponsor.id} className="rounded-2xl border border-white/10 bg-black p-5 transition hover:border-white/30 hover:bg-white/[0.04]">
            <SponsorLogo sponsor={sponsor} />
            <h3 className="mt-4 text-xl font-black">{sponsor.name}</h3>
            <p className="mt-2 text-sm text-zinc-500">{sponsor.level} · {sponsor.status}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{sponsor.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-zinc-500">{sponsor.contactPerson || "Ingen kontaktperson"}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <SmallButton tooltip="Åbner sponsorformularen med eksisterende data." onClick={() => openEditForm(sponsor)}>Rediger</SmallButton>
              <SmallButton tooltip="Fjerner kun sponsoren fra eventet." danger onClick={() => setRemoveSponsorId(sponsor.id)}>Fjern</SmallButton>
            </div>
          </article>
        )) : (
          <div className="rounded-2xl border border-white/10 bg-black p-6 text-sm font-bold text-zinc-400 md:col-span-2 xl:col-span-3">
            Der er endnu ikke tilknyttet sponsorer til dette event.
          </div>
        )}
      </div>

      {removingSponsor ? (
        <div className="mt-6 rounded-[2rem] border border-red-500/20 bg-red-500/10 p-5">
          <h3 className="text-xl font-black text-red-100">Fjern sponsor?</h3>
          <p className="mt-2 text-sm leading-6 text-red-100/80">
            Dette fjerner kun sponsoren fra eventet. Sponsordata kan stadig oprettes igen senere.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={confirmRemoveSponsor} className="rounded-full bg-red-500 px-5 py-3 font-black text-white transition hover:bg-red-400">
              Fjern {removingSponsor.name}
            </button>
            <button type="button" onClick={() => setRemoveSponsorId(null)} className="rounded-full border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
              Annuller
            </button>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function PermissionsTab({
  activeEvent,
  createWorkspaceLog,
}: {
  activeEvent?: ManagedEvent;
  createWorkspaceLog: (category: string, message: string) => void;
}) {
  return (
    <Panel step="Tilladelser" title="Eventtilladelser">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <p className="max-w-3xl text-sm leading-6 text-zinc-400">
          Registrer hvilke RP-tilladelser der er relevante for {activeEvent?.title ?? "eventet"}.
        </p>
        <button type="button" onClick={() => createWorkspaceLog("Tilladelse", `Tilladelsesflow åbnet for ${activeEvent?.title ?? "eventet"}.`)} className="rounded-2xl bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">
          Tilføj tilladelse
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {permissions.map((permission) => (
          <article key={permission.id} className="rounded-2xl border border-white/10 bg-black p-5 transition hover:border-white/30 hover:bg-white/[0.04]">
            <span className={`rounded-full px-3 py-1 text-xs font-black ${permission.status === "Godkendt" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-200"}`}>
              {permission.status}
            </span>
            <h3 className="mt-4 text-xl font-black">{permission.event}</h3>
            <p className="mt-2 text-sm text-zinc-500">{permission.location} · {permission.date}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{permission.comment}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-zinc-500">{permission.authority}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function createInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "DL";
}

function SponsorLogo({ sponsor }: { sponsor: Pick<EventSponsor, "name" | "logoInitials" | "logoUrl"> }) {
  const initials = sponsor.logoInitials || createInitials(sponsor.name);

  if (sponsor.logoUrl) {
    return (
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white bg-cover bg-center text-sm font-black text-black"
        style={{ backgroundImage: `url(${sponsor.logoUrl})` }}
        aria-label={`${sponsor.name} logo`}
      />
    );
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white text-sm font-black text-black">
      {initials}
    </div>
  );
}

function HelpDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const helpItems = [
    ["Check ind", "Markerer deltageren som mødt op til eventet."],
    ["DNF", "Did Not Finish: deltageren startede, men gennemførte ikke."],
    ["DNS", "Did Not Start: deltageren var tilmeldt, men startede ikke."],
    ["Diskvalificering", "Markerer deltageren som diskvalificeret fra eventet."],
    ["Point", "Style, angle, speed og line lægges sammen, og straf trækkes fra."],
    ["Tider", "Tider tages fra racing tablet ingame og skrives manuelt bagefter."],
    ["Placering", "Laveste placeringstal rangerer bedst."],
    ["Godkendelse", "Kun godkendte resultater tæller på live ranglisten."],
    ["Hall of Fame", "Opdateres først, når staff offentliggør vindere."],
    ["Rangliste", "Viser godkendte resultater og sorterer efter resultattype."],
  ];

  if (!open) return null;

  return (
    <aside className="fixed right-5 top-24 z-[80] w-[min(440px,calc(100vw-40px))] rounded-[2rem] border border-white/10 bg-black/95 p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Hjælp</p>
          <h2 className="mt-2 text-3xl font-black">EventOS begreber</h2>
        </div>
        <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
          Luk
        </button>
      </div>
      <div className="mt-6 grid gap-3">
        {helpItems.map(([title, text]) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="font-black">{title}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function LogList({ logs }: { logs: Array<{ id: string; time: string; category: string; message: string }> }) {
  return (
    <div className="grid max-h-[520px] gap-3 overflow-auto pr-1">
      {logs.length > 0 ? logs.map((logEntry) => (
        <div key={logEntry.id} className="rounded-2xl border border-white/10 bg-black p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{logEntry.time} · {logEntry.category}</p>
          <p className="mt-2 text-sm font-bold text-zinc-200">{logEntry.message}</p>
        </div>
      )) : (
        <EmptyState title="Ingen historik endnu" text="Aktivitet vises her, når staff arbejder i EventOS." />
      )}
    </div>
  );
}

function resultValue(entry: ReturnType<typeof getLiveLeaderboardRows>[number]) {
  if (entry.resultType === "time") return formatTime(entry.finalTime);
  if (entry.resultType === "placement") return `P${entry.placement ?? "-"}`;
  return `${entry.score ?? 0} point`;
}

function QuickAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border border-white/10 bg-black px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
      {label}
    </button>
  );
}

function MiniRow({ left, right }: { left: string; right: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black p-4">
      <p className="font-black">{left}</p>
      <p className="text-sm font-black text-zinc-300">{right}</p>
    </div>
  );
}

function Panel({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-6">
      <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">{step}</p>
      <h2 className="mt-2 text-2xl font-black md:text-3xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function TopStat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 truncate text-lg font-black text-white">{value}</p>
      {sub ? <p className="mt-1 text-sm text-zinc-500">{sub}</p> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: ManagedEvent["status"] }) {
  return (
    <span className={`inline-flex rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

function HelpBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="font-black">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{children}</p>
    </div>
  );
}

function Select({ label, value, onChange, children, disabled }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode; disabled?: boolean }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
    </label>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white" />
    </label>
  );
}

function NumberInput({ label, value, onChange, min = 0, step = "1" }: { label: string; value: number; onChange: (value: number) => void; min?: number; step?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <input type="number" min={min} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white" />
    </label>
  );
}

function Readout({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function SmallButton({ children, onClick, danger, tooltip }: { children: ReactNode; onClick: () => void; danger?: boolean; tooltip?: string }) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5 ${
        danger ? "border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500 hover:text-white" : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/30 hover:bg-white hover:text-black"
      }`}
    >
      {children}
    </button>
  );

  return tooltip ? <Tooltip text={tooltip}>{button}</Tooltip> : button;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-6 text-center">
      <p className="font-black">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );
}

