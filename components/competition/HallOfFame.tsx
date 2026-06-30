"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const champions = [
  {
    title: "Drift Champion",
    name: "Cole Kane",
    record: "1 Championship",
    icon: "💨",
  },
  {
    title: "Race Champion",
    name: "Cole Kane",
    record: "25 Points",
    icon: "🏁",
  },
  {
    title: "Drag Champion",
    name: "Cole Kane",
    record: "08.690 Sec",
    icon: "🚀",
  },
  {
    title: "Car Show Winner",
    name: "Izadora Solis",
    record: "121 / 125 Points",
    icon: "🚗",
  },
];

const records = [
  { label: "Most Wins", name: "Cole Kane", value: "3" },
  { label: "Fastest Drag", name: "Cole Kane", value: "08.690" },
  { label: "Best Car Show Score", name: "Izadora Solis", value: "121" },
  { label: "Highest Drift Placement", name: "Cole Kane", value: "Champion" },
];

export default function HallOfFame() {
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
              Hall of Fame
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Vindere, rekorder og champions fra DarkLight Events. Senere bliver
              historikken automatisk gemt efter hvert event.
            </p>
          </div>

          <Link
            href="/competition"
            className="w-fit rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-white hover:bg-white/10"
          >
            ← Tilbage
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {champions.map((champion, index) => (
            <motion.article
              key={champion.title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 text-center backdrop-blur-xl"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black text-4xl">
                {champion.icon}
              </div>

              <p className="mb-3 text-xs uppercase tracking-[0.35em] text-zinc-500">
                {champion.title}
              </p>

              <h2 className="text-2xl font-black">{champion.name}</h2>

              <p className="mt-3 text-zinc-400">{champion.record}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <h2 className="mb-8 text-3xl font-black">
            Event Records
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {records.map((record, index) => (
              <motion.div
                key={record.label}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black p-5"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                    {record.label}
                  </p>

                  <p className="mt-2 font-black">{record.name}</p>
                </div>

                <p className="text-2xl font-black">{record.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}