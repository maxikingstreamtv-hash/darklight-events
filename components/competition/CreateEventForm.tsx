"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { ManagedEvent } from "@/data/event-manager";
import { createEventFromTemplate, getTemplates } from "@/components/competition/template-engine";
import { useEventOSStore } from "@/components/competition/eventos-store";
import type { EventTemplate } from "@/data/event-templates";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreateEventForm() {
  const templates = useMemo(() => getTemplates(), []);
  const { createEvent } = useEventOSStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id ?? "");
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);
  const templateEvent = selectedTemplateId
    ? createEventFromTemplate(selectedTemplateId)
    : undefined;
  const [title, setTitle] = useState(templateEvent?.title ?? "");
  const [type, setType] = useState(templateEvent?.type ?? "Drift");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(templateEvent?.time ?? "20:00");
  const [location, setLocation] = useState(templateEvent?.location ?? "");
  const [maxParticipants, setMaxParticipants] = useState(
    templateEvent?.maxParticipants ?? 32
  );
  const [heats, setHeats] = useState(selectedTemplate?.defaultHeats ?? 4);
  const [judges, setJudges] = useState(selectedTemplate?.recommendedJudges ?? 2);
  const [status, setStatus] = useState<ManagedEvent["status"]>(templateEvent?.status ?? "Ready");
  const [submitMessage, setSubmitMessage] = useState("");

  function applyTemplate(template: EventTemplate) {
    const eventDraft = createEventFromTemplate(template.id);

    setSelectedTemplateId(template.id);
    setTitle(eventDraft?.title ?? `${template.name} #01`);
    setType(eventDraft?.type ?? template.type);
    setTime(eventDraft?.time ?? "20:00");
    setLocation(eventDraft?.location ?? template.defaultLocation);
    setMaxParticipants(eventDraft?.maxParticipants ?? template.defaultMaxParticipants);
    setHeats(template.defaultHeats);
    setJudges(template.recommendedJudges);
    setStatus(eventDraft?.status ?? template.defaultStatus);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const eventId = `${slugify(title || selectedTemplate?.name || "darklight-event")}-${Date.now()}`;
    const event: ManagedEvent = {
      id: eventId,
      title: title || selectedTemplate?.name || "DarkLight Event",
      type,
      date: date || new Date().toISOString().slice(0, 10),
      time,
      location,
      status,
      participants: 0,
      maxParticipants,
      href: `/competition/events/${eventId}`,
    };

    createEvent(event);
    setSubmitMessage("Event oprettet i EventOS og synligt i Event Manager.");
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <p className="mb-3 text-sm uppercase tracking-[0.45em] text-zinc-500">
          DarkLight EventOS
        </p>
        <h2 className="text-3xl font-black md:text-5xl">Vælg event template</h2>
        <p className="mt-4 max-w-3xl text-zinc-400">
          Start med en RP-klar skabelon. EventOS udfylder heats, dommere,
          deltagerlimit, regler, tidsplan og pointsystem for staff.
        </p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-black p-4 text-sm leading-6 text-zinc-400">
          Manual Event Data: Eventet oprettes i den aktive EventOS-session.
          Permanent database kan tilfoejes senere.
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const isActive = template.id === selectedTemplateId;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template)}
                className={`rounded-[2rem] border p-6 text-left transition hover:-translate-y-1 hover:border-white/30 ${
                  isActive
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-black text-white"
                }`}
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-3xl">
                    {template.icon}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${
                      isActive ? "bg-black text-white" : "border border-white/10 text-zinc-400"
                    }`}
                  >
                    {template.defaultHeats} heats
                  </span>
                </div>

                <h3 className="text-2xl font-black">{template.name}</h3>
                <p className={`mt-3 text-sm leading-6 ${isActive ? "text-zinc-700" : "text-zinc-500"}`}>
                  {template.description}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <TemplateMeta label="Max" value={template.defaultMaxParticipants} active={isActive} />
                  <TemplateMeta label="Judges" value={template.recommendedJudges} active={isActive} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
        <h2 className="mb-8 text-3xl font-black">Opret nyt event</h2>

        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <Input label="Event navn" value={title} onChange={setTitle} />

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Eventtype</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
            >
              <option>Drift</option>
              <option>Race</option>
              <option>Drag</option>
              <option>Car Meet</option>
              <option>Car Show</option>
              <option>Offroad</option>
              <option>Motocross</option>
              <option>Golf Cart</option>
              <option>Lawnmower</option>
              <option>Demolition Derby</option>
              <option>Mr. DreamLight</option>
              <option>Miss. DreamLight</option>
            </select>
          </div>

          <Input label="Dato" type="date" value={date} onChange={setDate} />
          <Input label="Tid" type="time" value={time} onChange={setTime} />
          <Input label="Lokation" value={location} onChange={setLocation} />
          <Input
            label="Maks deltagere"
            type="number"
            value={String(maxParticipants)}
            onChange={(value) => setMaxParticipants(Number(value))}
          />
          <Input
            label="Antal heats"
            type="number"
            value={String(heats)}
            onChange={(value) => setHeats(Number(value))}
          />
          <Input
            label="Anbefalede dommere"
            type="number"
            value={String(judges)}
            onChange={(value) => setJudges(Number(value))}
          />

          <div>
            <label className="mb-2 block text-sm text-zinc-400">Eventstatus</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ManagedEvent["status"])}
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-white"
            >
              <option>Ready</option>
              <option>Live</option>
              <option>Paused</option>
              <option>Finished</option>
              <option>Archived</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <TemplatePreview template={selectedTemplate} />
          </div>

          {submitMessage ? (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm font-black text-green-400 md:col-span-2">
              {submitMessage}
            </div>
          ) : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-300"
            >
              Opret event fra template
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TemplatePreview({ template }: { template?: EventTemplate }) {
  if (!template) {
    return null;
  }

  return (
    <div className="grid gap-5 rounded-[2rem] border border-white/10 bg-black p-6 lg:grid-cols-3">
      <PreviewList title="Standard regler" items={template.defaultRules} />
      <PreviewList title="Standard tidsplan" items={template.defaultSchedule} />
      <PreviewList title="Standard pointsystem" items={template.defaultPointSystem} />
    </div>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-4 text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplateMeta({ label, value, active }: { label: string; value: string | number; active: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${active ? "border-black/10 bg-black/5" : "border-white/10 bg-white/[0.03]"}`}>
      <p className={`text-xs uppercase tracking-[0.25em] ${active ? "text-zinc-700" : "text-zinc-500"}`}>{label}</p>
      <p className="mt-1 font-black">{value}</p>
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
      <label className="mb-2 block text-sm text-zinc-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none transition focus:border-white"
      />
    </div>
  );
}


