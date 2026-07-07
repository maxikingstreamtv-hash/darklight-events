"use client";

import { useMemo, useState } from "react";
import {
  driftScoring,
  carShowScoring,
  dreamlightScoring,
  derbyScoring,
  motocrossScoring,
  dragScoring,
  raceScoring,
} from "@/data/scoring";

const scoringTypes = {
  Drift: driftScoring,
  "Car Show": carShowScoring,
  DreamLight: dreamlightScoring,
  Derby: derbyScoring,
  Motocross: motocrossScoring,
  Drag: dragScoring,
  Race: raceScoring,
};

export default function JudgePanel() {
  const [eventType, setEventType] = useState<keyof typeof scoringTypes>("Drift");
  const [winner, setWinner] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saveMessage, setSaveMessage] = useState("");

  const fields = scoringTypes[eventType];

  const total = useMemo(() => {
    return fields.reduce((sum, field) => sum + (scores[field] || 0), 0);
  }, [fields, scores]);

  function updateScore(field: string, value: string) {
    setScores((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  }

  function handleSave() {
    setSaveMessage("Resultat gemt i dommerpanelet.");
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
      <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-zinc-500">
            Dommerpanel
          </p>

          <h2 className="text-3xl font-black">
            Registrer point
          </h2>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Vælg eventtype, indtast point og vælg vinder. Senere gemmes dette
            direkte i databasen.
          </p>
        </div>

        <select
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value as keyof typeof scoringTypes);
            setScores({});
            setWinner("");
          }}
          className="rounded-2xl border border-white/10 bg-black px-5 py-4 font-bold text-white outline-none focus:border-white"
        >
          {Object.keys(scoringTypes).map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field}
              className="rounded-2xl border border-white/10 bg-black p-5"
            >
              <label className="mb-3 block text-sm uppercase tracking-[0.25em] text-zinc-500">
                {field}
              </label>

              <input
                type="number"
                min="0"
                max="100"
                value={scores[field] || ""}
                onChange={(e) => updateScore(field, e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-2xl font-black text-white outline-none transition focus:border-white"
                placeholder="0"
              />
            </div>
          ))}

          <div className="rounded-2xl border border-white/10 bg-black p-5 md:col-span-2">
            <label className="mb-3 block text-sm uppercase tracking-[0.25em] text-zinc-500">
              Vinder
            </label>

            <input
              type="text"
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-white outline-none transition focus:border-white"
              placeholder="Indtast vinderens navn"
            />
          </div>
        </div>

        <div className="h-fit rounded-[2rem] border border-white/10 bg-black p-7">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-zinc-500">
            Resultat
          </p>

          <p className="text-6xl font-black">{total}</p>

          <p className="mt-3 text-zinc-500">Samlet score</p>

          <div className="mt-8 space-y-3">
            {fields.map((field) => (
              <div
                key={field}
                className="flex items-center justify-between border-b border-white/10 pb-3 text-sm"
              >
                <span className="text-zinc-500">{field}</span>
                <span className="font-black">{scores[field] || 0}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-zinc-500">Vinder</p>
            <p className="mt-2 text-xl font-black">
              {winner || "Ikke valgt"}
            </p>
          </div>

          {saveMessage ? (
            <div className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm font-black text-green-400">
              {saveMessage}
            </div>
          ) : null}

          <button
            onClick={handleSave}
            className="mt-8 w-full rounded-full bg-white px-6 py-4 font-black text-black transition hover:bg-zinc-300"
          >
            Gem resultat
          </button>
        </div>
      </div>
    </div>
  );
}

