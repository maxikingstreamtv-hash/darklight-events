"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { competitions } from "@/data/competition";

const overview = [
  { label: "Aktive events", value: "0", text: "Live events kommer senere" },
  { label: "Discipliner", value: "13", text: "Scoreboards og turneringer" },
  { label: "Hall of Fame", value: "Soon", text: "Vindere og rekorder" },
  { label: "Live TV Mode", value: "Soon", text: "Storskærmsvisning" },
];

export default function EventControlDashboard() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
            DarkLight Events
          </p>

          <h1 className="text-5xl font-black md:text-7xl">
            Event Control Center
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-zinc-400">
            Det centrale kontrolcenter for turneringer, scoreboards, live events,
            rankings og fremtidige admin-værktøjer.
          </p>
        </div>

        <div className="mb-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {overview.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                {item.label}
              </p>

              <p className="mt-4 text-4xl font-black">{item.value}</p>

              <p className="mt-3 text-sm text-zinc-400">{item.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.45em] text-zinc-500">
              Scoreboards
            </p>

            <h2 className="text-4xl font-black md:text-5xl">
              Vælg disciplin
            </h2>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-zinc-400">
            Public prototype · Firebase senere
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {competitions.map((competition, index) => {
            const isReady = competition.status === "Klar";

            return (
              <motion.article
                key={competition.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

                <div className="mb-8 flex items-center justify-between gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black text-3xl">
                    {competition.icon}
                  </div>

                  <span
                    className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.2em] ${
                      isReady
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-white/10 bg-black text-zinc-600"
                    }`}
                  >
                    {competition.status}
                  </span>
                </div>

                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
                  {competition.subtitle}
                </p>

                <h3 className="text-2xl font-black">{competition.title}</h3>

                <p className="mt-4 min-h-24 text-sm leading-7 text-zinc-400">
                  {competition.description}
                </p>

                {isReady ? (
                  <Link
                    href={competition.href}
                    className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-black text-black transition hover:scale-105 hover:bg-zinc-300"
                  >
                    Åbn →
                  </Link>
                ) : (
                  <button
                    disabled
                    className="mt-8 inline-flex cursor-not-allowed rounded-full border border-white/10 px-6 py-3 font-black text-zinc-600"
                  >
                    Kommer snart
                  </button>
                )}
              </motion.article>
            );
          })}
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          <InfoBox
            title="Hall of Fame"
            text="Samlet oversigt over champions, rekorder og tidligere vindere."
            href="/competition/hall-of-fame"
          />

          <InfoBox
            title="Live TV Mode"
            text="Storskærmsvisning til aktive events med resultater og battles."
            href="/competition/live"
          />

          <InfoBox
            title="Staff Control"
            text="Fremtidigt panel til dommere, deltagere og live pointstyring."
            href="/login"
          />
        </div>
      </div>
    </section>
  );
}

function InfoBox({
  title,
  text,
  href,
}: {
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition hover:-translate-y-2 hover:border-white/30"
    >
      <h3 className="text-2xl font-black">{title}</h3>

      <p className="mt-4 text-sm leading-7 text-zinc-400">{text}</p>

      <p className="mt-7 font-black text-white">
        Åbn modul →
      </p>
    </Link>
  );
}