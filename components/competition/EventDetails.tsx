"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEventOSStore } from "@/components/competition/eventos-store";
import ParticipantList from "@/components/competition/ParticipantList";

export default function EventDetails({ eventId }: { eventId: string }) {
  const { events } = useEventOSStore();
  const event = events.find((item) => item.id === eventId);

  if (!event) {
    return (
      <section className="bg-black px-6 py-28 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-black">Event ikke fundet</h1>
          <Link href="/competition/events" className="mt-6 inline-flex underline">
            Tilbage til eventoversigt
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              Eventkontrol
            </p>

            <h1 className="text-4xl font-black md:text-6xl">{event.title}</h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Detaljeside til styring af eventinformation, deltagere, status og
              hurtige handlinger.
            </p>
          </div>

          <Link
            href="/competition/events"
            className="w-fit rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-white hover:bg-white/10"
          >
            ← Tilbage
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
          >
            <div className="mb-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
                {event.type}
              </span>

              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em]">
                {event.status}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Info title="Dato" value={event.date} />
              <Info title="Tid" value={event.time} />
              <Info title="Lokation" value={event.location} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Deltagere</p>

            <p className="mt-3 text-5xl font-black">
              {event.participants}/{event.maxParticipants}
            </p>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
              />
            </div>
          </motion.div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <ActionButton label="Tilføj deltager" href="/competition/control-center" />
          <ActionButton label="Start event" href="/competition/control-center" />
          <ActionButton label="Åbn livecenter" href="/competition/live-center" />
          <ActionButton label="Afslut event" href="/competition/control-center" danger />
        </div>

        <div className="mt-10">
          <ParticipantList />
        </div>
      </div>
    </section>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">{title}</p>
      <p className="mt-3 text-xl font-black">{value}</p>
    </div>
  );
}

function ActionButton({ label, href, danger = false }: { label: string; href: string; danger?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border px-5 py-4 font-black transition ${
        danger
          ? "border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"
          : "border-white/10 bg-white/[0.04] text-white hover:bg-white hover:text-black"
      }`}
    >
      {label}
    </Link>
  );
}
