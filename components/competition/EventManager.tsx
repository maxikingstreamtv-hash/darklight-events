"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { managedEvents } from "@/data/event-manager";
import ParticipantList from "@/components/competition/ParticipantList";

export default function EventManager() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              Event Control Center
            </p>

            <h1 className="text-4xl font-black md:text-6xl">
              Event Manager
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Her får DarkLight Events overblik over planlagte events,
              deltagere, status og hurtige handlinger.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
  <Link
    href="/competition/events/create"
    className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:scale-105 hover:bg-zinc-300"
  >
    + Opret Event
  </Link>

  <Link
    href="/competition"
    className="rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-white hover:bg-white/10"
  >
    ← Tilbage
  </Link>
</div>
        </div>

        <div className="grid gap-6">
          {managedEvents.map((event, index) => (
            <motion.article
              key={event.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_220px] lg:items-center">
                <div>
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
                      {event.type}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em]">
                      {event.status}
                    </span>
                  </div>

                  <h2 className="text-3xl font-black">{event.title}</h2>

                  <div className="mt-5 grid gap-4 text-sm text-zinc-400 md:grid-cols-3">
                    <Info label="Dato" value={event.date} />
                    <Info label="Tid" value={event.time} />
                    <Info label="Lokation" value={event.location} />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black p-5 text-center">
                  <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                    Deltagere
                  </p>

                  <p className="mt-3 text-4xl font-black">
                    {event.participants}/{event.maxParticipants}
                  </p>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{
                        width: `${
                          (event.participants / event.maxParticipants) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={event.href}
                  className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:scale-105 hover:bg-zinc-300"
                >
                  Åbn event →
                </Link>

                <button className="rounded-full border border-white/20 px-6 py-3 font-bold transition hover:border-white hover:bg-white/10">
                  Tilføj deltager
                </button>

                <button className="rounded-full border border-white/20 px-6 py-3 font-bold transition hover:border-white hover:bg-white/10">
                  Start event
                </button>

                <button className="rounded-full border border-white/20 px-6 py-3 font-bold transition hover:border-white hover:bg-white/10">
                  Åbn Live TV
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10">
          <ParticipantList />
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">
        {label}
      </p>
      <p className="mt-2 font-bold text-zinc-300">{value}</p>
    </div>
  );
}