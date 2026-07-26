"use client";

import { useState } from "react";
import type { DisciplinePreset } from "@/lib/events/disciplines";
import { disciplineFeatures } from "@/lib/events/disciplines";
import type { EventFeatures } from "@/lib/events/event-features";

export default function EventFeatureFields({ initial, disciplines = [], selectedDisciplineId = "" }: { initial: EventFeatures; disciplines?: DisciplinePreset[]; selectedDisciplineId?: string }) {
  const [features, setFeatures] = useState(initial);
  const [disciplineId, setDisciplineId] = useState(selectedDisciplineId);

  function setFeature(name: keyof EventFeatures, checked: boolean) {
    setFeatures((current) => {
      const next = { ...current, [name]: checked };
      if (name === "usesVehicles" && !checked) next.requiresVehicleApproval = false;
      return next;
    });
  }

  function selectDiscipline(id: string) {
    setDisciplineId(id);
    const discipline = disciplines.find((item) => item.id === id);
    if (discipline) setFeatures(disciplineFeatures(discipline));
  }

  return (
    <div className="grid gap-4">
      {disciplines.length > 0 ? (
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Disciplin</span>
          <select name="disciplineId" value={disciplineId} onChange={(event) => selectDiscipline(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white">
            <option value="">Andet / ingen disciplin</option>
            {disciplines.filter((discipline) => discipline.active).map((discipline) => (
              <option key={discipline.id} value={discipline.id}>{discipline.name}</option>
            ))}
          </select>
          <span className="text-xs text-zinc-500">Valget foreslår standardfunktioner. Du kan ændre dem individuelt bagefter.</span>
        </label>
      ) : null}
      <fieldset className="rounded-[2rem] border border-white/10 bg-black p-5">
        <legend className="px-2 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Eventfunktioner</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Toggle name="usesParticipantRegistration" label="Deltagertilmelding" checked={features.usesParticipantRegistration} onChange={(checked) => setFeature("usesParticipantRegistration", checked)} />
          <Toggle name="usesVehicles" label="Dette event bruger køretøjer" checked={features.usesVehicles} onChange={(checked) => setFeature("usesVehicles", checked)} />
          <Toggle name="requiresVehicleApproval" label="Kræv godkendelse af køretøjer" checked={features.requiresVehicleApproval} disabled={!features.usesVehicles} onChange={(checked) => setFeature("requiresVehicleApproval", checked)} />
          <Toggle name="usesHeats" label="Køreliste / heats" checked={features.usesHeats} onChange={(checked) => setFeature("usesHeats", checked)} />
          <Toggle name="usesBracket" label="Bracket" checked={features.usesBracket} onChange={(checked) => setFeature("usesBracket", checked)} />
          <Toggle name="usesResults" label="Resultater" checked={features.usesResults} onChange={(checked) => setFeature("usesResults", checked)} />
          <Toggle name="usesPrizes" label="Præmier" checked={features.usesPrizes} onChange={(checked) => setFeature("usesPrizes", checked)} />
        </div>
        {!features.usesVehicles ? <p className="mt-3 text-xs text-zinc-500">Eksisterende køretøjsdata bevares, men bruges ikke af eventets workflow eller validering.</p> : null}
      </fieldset>
    </div>
  );
}

function Toggle({ name, label, checked, onChange, disabled = false }: { name: string; label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-zinc-300">
      <input name={name} type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}
