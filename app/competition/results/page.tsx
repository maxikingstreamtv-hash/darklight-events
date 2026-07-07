"use client";

import { useMemo, useState, type FormEvent } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import LiveLeaderboard from "@/components/competition/LiveLeaderboard";
import { useEventOSStore } from "@/components/competition/eventos-store";
import { calculateFinalTime, calculateTotalScore } from "@/components/competition/result-engine";
import Badge from "@/components/competition/ui/Badge";
import Button from "@/components/competition/ui/Button";
import Card from "@/components/competition/ui/Card";
import SectionHeader from "@/components/competition/ui/SectionHeader";
import StatCard from "@/components/competition/ui/StatCard";
import Tooltip from "@/components/competition/ui/Tooltip";
import { drivers } from "@/data/drivers";
import type { ResultScore, ResultStatus } from "@/data/results";

const statusTone: Record<ResultStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const statusLabels: Record<ResultStatus, string> = {
  pending: "Afventer",
  approved: "Godkendt",
  rejected: "Afvist",
};

function getDriverName(driverId: string) {
  return drivers.find((driver) => driver.id === driverId)?.name ?? "Ukendt kører";
}

function resultTypeLabel(score: ResultScore) {
  if (score.resultType === "time") return "Tid";
  if (score.resultType === "placement") return "Placering";
  return "Point";
}

function resultValue(score: ResultScore) {
  if (score.resultType === "time") return `${(score.finalTime ?? score.time ?? 0).toFixed(3)}s`;
  if (score.resultType === "placement") return `P${score.placement ?? "-"}`;
  return `${score.total} point`;
}

function createEditState(score: ResultScore) {
  return {
    id: score.id,
    status: score.status,
    judge: score.judge,
    style: score.style,
    speed: score.speed,
    angle: score.angle,
    line: score.line,
    penalty: score.penalty,
    rawTime: score.time ?? 0,
    penaltySeconds: score.penaltySeconds ?? 0,
    placement: score.placement ?? 1,
    notes: score.notes ?? "",
  };
}

export default function ResultsPage() {
  const { results, approveResult, rejectResult, updateResult, deleteResult } = useEventOSStore();
  const [editing, setEditing] = useState<ReturnType<typeof createEditState> | null>(null);
  const [feedback, setFeedback] = useState("");
  const pending = results.filter((score) => score.status === "pending");
  const approved = results.filter((score) => score.status === "approved");
  const rejected = results.filter((score) => score.status === "rejected");
  const editingResult = editing ? results.find((score) => score.id === editing.id) : undefined;
  const editTotal = useMemo(
    () => editing ? calculateTotalScore(editing) : 0,
    [editing]
  );
  const editFinalTime = useMemo(
    () => editing ? calculateFinalTime(editing.rawTime, editing.penaltySeconds) : 0,
    [editing]
  );

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || !editingResult) return;

    const resultType = editingResult.resultType ?? "score";
    const placementScore = Math.max(1000 - editing.placement, 0);

    updateResult(editing.id, {
      status: editing.status,
      judge: editing.judge,
      style: resultType === "score" ? editing.style : 0,
      speed: resultType === "score" ? editing.speed : 0,
      angle: resultType === "score" ? editing.angle : 0,
      line: resultType === "score" ? editing.line : 0,
      penalty: resultType === "score" ? editing.penalty : 0,
      total: resultType === "score" ? editTotal : resultType === "placement" ? placementScore : 0,
      time: resultType === "time" ? editing.rawTime : undefined,
      penaltySeconds: resultType === "time" ? editing.penaltySeconds : undefined,
      finalTime: resultType === "time" ? editFinalTime : undefined,
      placement: resultType === "placement" ? editing.placement : undefined,
      notes: editing.notes,
    });
    setFeedback("Ændringerne er gemt på samme resultat-id. Der er ikke oprettet en dublet.");
    setEditing(null);
  }

  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <SectionHeader
                title="Resultatstyring"
                text="Se, rediger, godkend, afvis og slet resultater. Redigering opdaterer samme resultat og opretter ikke en ny linje på ranglisten."
              />
              <Button href="/competition/leaderboard" variant="primary">Åbn live rangliste</Button>
            </div>

            {feedback ? (
              <div className="mb-8 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-sm font-black text-green-300">
                {feedback}
              </div>
            ) : null}

            <div className="mb-8 grid gap-5 md:grid-cols-3">
              <StatCard title="Afventer" value={pending.length} text="Skal godkendes eller afvises" />
              <StatCard title="Godkendt" value={approved.length} text="Vises på live ranglisten" />
              <StatCard title="Afvist" value={rejected.length} text="Tæller ikke med" />
            </div>

            {editing && editingResult ? (
              <Card className="mb-8 p-6">
                <h2 className="text-3xl font-black">Redigerer resultat</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Resultat-id: {editing.id}. Gem ændringer opdaterer samme linje og genberegner ranglisten.
                </p>
                <form onSubmit={saveEdit} className="mt-6 grid gap-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="grid gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Status</span>
                      <select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as ResultStatus })} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white">
                        <option value="pending">Afventer</option>
                        <option value="approved">Godkendt</option>
                        <option value="rejected">Afvist</option>
                      </select>
                    </label>
                    <TextInput label="Dommer" value={editing.judge} onChange={(value) => setEditing({ ...editing, judge: value })} />
                    <Readout label="Resultattype" value={resultTypeLabel(editingResult)} />
                  </div>

                  {(editingResult.resultType ?? "score") === "score" ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      <NumberInput label="Style" value={editing.style} onChange={(value) => setEditing({ ...editing, style: value })} />
                      <NumberInput label="Speed" value={editing.speed} onChange={(value) => setEditing({ ...editing, speed: value })} />
                      <NumberInput label="Angle" value={editing.angle} onChange={(value) => setEditing({ ...editing, angle: value })} />
                      <NumberInput label="Line" value={editing.line} onChange={(value) => setEditing({ ...editing, line: value })} />
                      <NumberInput label="Straf" value={editing.penalty} onChange={(value) => setEditing({ ...editing, penalty: value })} />
                      <Readout label="Ny total" value={editTotal} />
                    </div>
                  ) : null}

                  {editingResult.resultType === "time" ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      <NumberInput label="Tid fra racing tablet" value={editing.rawTime} onChange={(value) => setEditing({ ...editing, rawTime: value })} step="0.001" />
                      <NumberInput label="Strafsekunder" value={editing.penaltySeconds} onChange={(value) => setEditing({ ...editing, penaltySeconds: value })} step="0.001" />
                      <Readout label="Ny final tid" value={`${editFinalTime.toFixed(3)}s`} />
                    </div>
                  ) : null}

                  {editingResult.resultType === "placement" ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <NumberInput label="Placering" value={editing.placement} onChange={(value) => setEditing({ ...editing, placement: value })} min={1} />
                      <Readout label="Ranglisteværdi" value={Math.max(1000 - editing.placement, 0)} />
                    </div>
                  ) : null}

                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Noter</span>
                    <textarea value={editing.notes} onChange={(event) => setEditing({ ...editing, notes: event.target.value })} className="min-h-28 rounded-2xl border border-white/10 bg-black px-4 py-3 text-white" />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <Tooltip text="Gemmer ændringer på samme resultat-id og genberegner ranglisten.">
                      <Button variant="primary">Gem ændringer</Button>
                    </Tooltip>
                    <Tooltip text="Lukker redigering uden at gemme ændringer.">
                      <Button type="button" onClick={() => setEditing(null)} variant="secondary">Annuller</Button>
                    </Tooltip>
                  </div>
                </form>
              </Card>
            ) : null}

            <div className="grid gap-8">
              <ResultGroup title="Afventende resultater" empty="Ingen afventende resultater." results={pending} onApprove={approveResult} onReject={rejectResult} onEdit={(score) => setEditing(createEditState(score))} onDelete={deleteResult} />
              <ResultGroup title="Godkendte resultater" empty="Ingen godkendte resultater endnu." results={approved} onApprove={approveResult} onReject={rejectResult} onEdit={(score) => setEditing(createEditState(score))} onDelete={deleteResult} />
              <ResultGroup title="Afviste resultater" empty="Ingen afviste resultater." results={rejected} onApprove={approveResult} onReject={rejectResult} onEdit={(score) => setEditing(createEditState(score))} onDelete={deleteResult} />
              <LiveLeaderboard
                title="Live rangliste"
                description="Denne liste viser kun godkendte resultater. Afventende og afviste resultater påvirker ikke ranglisten."
              />
            </div>
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </>
  );
}

function ResultGroup({
  title,
  empty,
  results,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: {
  title: string;
  empty: string;
  results: ResultScore[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (score: ResultScore) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section>
      <h2 className="mb-4 text-3xl font-black">{title}</h2>
      <div className="grid gap-5">
        {results.length > 0 ? (
          results.map((score) => (
            <ResultCard
              key={score.id}
              score={score}
              onApprove={() => onApprove(score.id)}
              onReject={() => onReject(score.id)}
              onEdit={() => onEdit(score)}
              onDelete={() => onDelete(score.id)}
            />
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-zinc-500">{empty}</p>
          </Card>
        )}
      </div>
    </section>
  );
}

function ResultCard({
  score,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}: {
  score: ResultScore;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const calculatedTotal = calculateTotalScore(score);
  const isApproved = score.status === "approved";
  const isRejected = score.status === "rejected";
  const isTimeResult = score.resultType === "time";
  const isPlacementResult = score.resultType === "placement";

  return (
    <Card as="article" interactive className="p-6">
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge>{score.id}</Badge>
            <Badge tone={statusTone[score.status]}>{statusLabels[score.status]}</Badge>
            <Badge>{resultTypeLabel(score)}</Badge>
          </div>

          <h3 className="text-2xl font-black">{getDriverName(score.driverId)}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {score.eventId} · {score.heatId} · Dommer: {score.judge}
          </p>
          {score.notes ? <p className="mt-3 text-sm leading-6 text-zinc-400">{score.notes}</p> : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black px-6 py-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{resultTypeLabel(score)}</p>
          <p className="mt-2 text-4xl font-black">{resultValue(score)}</p>
        </div>
      </div>

      {isTimeResult ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Breakdown label="Tid fra tablet" value={`${score.time ?? 0}s`} />
          <Breakdown label="Strafsekunder" value={score.penaltySeconds ?? 0} />
          <Breakdown label="Final tid" value={`${score.finalTime ?? score.time ?? 0}s`} />
        </div>
      ) : isPlacementResult ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Breakdown label="Placering" value={`P${score.placement ?? "-"}`} />
          <Breakdown label="Ranglisteværdi" value={score.total} />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Breakdown label="Style" value={score.style} />
          <Breakdown label="Fart" value={score.speed} />
          <Breakdown label="Angle" value={score.angle} />
          <Breakdown label="Line" value={score.line} />
          <Breakdown label="Straf" value={score.penalty} />
          <Breakdown label="Beregnet" value={calculatedTotal} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Tooltip text="Åbner resultatet til redigering uden at oprette en dublet.">
          <Button onClick={onEdit} variant="secondary">Rediger</Button>
        </Tooltip>
        <Tooltip text="Godkender resultatet og viser det på live ranglisten.">
          <Button onClick={onApprove} variant="primary" disabled={isApproved}>Godkend</Button>
        </Tooltip>
        <Tooltip text="Afviser resultatet, så det ikke tæller med.">
          <Button onClick={onReject} variant="danger" disabled={isRejected}>Afvis</Button>
        </Tooltip>
        <Tooltip text="Sletter resultatlinjen fra EventOS. Driverprofilen slettes ikke.">
          <Button onClick={onDelete} variant="danger">Slet</Button>
        </Tooltip>
      </div>
    </Card>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white" />
    </label>
  );
}

function NumberInput({ label, value, onChange, min = 0, step = "1" }: { label: string; value: number; onChange: (value: number) => void; min?: number; step?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <input type="number" min={min} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white" />
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

function Breakdown({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.03]">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

