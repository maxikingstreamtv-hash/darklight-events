"use client";

import { useState } from "react";

export default function CreateEventForm() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Drift");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(32);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    alert("Event oprettet (kommer senere i database)");
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
      <h2 className="mb-8 text-3xl font-black">
        Opret nyt event
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 md:grid-cols-2"
      >
        <Input
          label="Event navn"
          value={title}
          onChange={setTitle}
        />

        <div>
          <label className="mb-2 block text-sm text-zinc-400">
            Eventtype
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
          >
            <option>Drift</option>
            <option>Race</option>
            <option>Drag</option>
            <option>Car Show</option>
            <option>Motocross</option>
            <option>Golf Cart</option>
            <option>Lawnmower</option>
            <option>Demolition Derby</option>
            <option>Mr. DreamLight</option>
            <option>Miss. DreamLight</option>
          </select>
        </div>

        <Input
          label="Dato"
          type="date"
          value={date}
          onChange={setDate}
        />

        <Input
          label="Tid"
          type="time"
          value={time}
          onChange={setTime}
        />

        <Input
          label="Lokation"
          value={location}
          onChange={setLocation}
        />

        <Input
          label="Maks deltagere"
          type="number"
          value={String(maxParticipants)}
          onChange={(value) => setMaxParticipants(Number(value))}
        />

        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-300"
          >
            Opret event
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none transition focus:border-white"
      />
    </div>
  );
}