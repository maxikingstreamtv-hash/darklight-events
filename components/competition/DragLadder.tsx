"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const heats = [
  {
    round: "Heat 1",
    driverA: "Cole Kane",
    driverB: "Lucas Storm",
    winner: "Cole Kane",
    reaction: "0.021",
    time: "08.942",
    speed: "318 km/t",
  },
  {
    round: "Heat 2",
    driverA: "Izadora Solis",
    driverB: "Alex Corleone",
    winner: "Izadora Solis",
    reaction: "0.034",
    time: "09.117",
    speed: "305 km/t",
  },
  {
    round: "Semifinale",
    driverA: "Cole Kane",
    driverB: "Izadora Solis",
    winner: "Cole Kane",
    reaction: "0.018",
    time: "08.781",
    speed: "326 km/t",
  },
  {
    round: "Finale",
    driverA: "Cole Kane",
    driverB: "Miklo Rodriguez",
    winner: "Cole Kane",
    reaction: "0.015",
    time: "08.690",
    speed: "331 km/t",
  },
];

export default function DragLadder() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              Competition Center
            </p>

            <h1 className="text-4xl font-black md:text-6xl">
              Drag Racing Ladder
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Drag-system til heats, semifinaler og finaler med reaktionstid,
              sluttid og topfart.
            </p>
          </div>

          <Link
            href="/competition"
            className="w-fit rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-white hover:bg-white/10"
          >
            ← Tilbage
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {heats.map((heat, index) => (
            <motion.article
              key={heat.round}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

              <p className="mb-6 text-sm uppercase tracking-[0.35em] text-zinc-500">
                {heat.round}
              </p>

              <Driver name={heat.driverA} winner={heat.winner === heat.driverA} />

              <div className="my-4 text-center text-xs font-black uppercase tracking-[0.35em] text-zinc-600">
                VS
              </div>

              <Driver name={heat.driverB} winner={heat.winner === heat.driverB} />

              <div className="mt-7 rounded-2xl border border-white/10 bg-black p-5">
                <Stat label="Reaction" value={heat.reaction} />
                <Stat label="Tid" value={heat.time} />
                <Stat label="Top Speed" value={heat.speed} />
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
          <p className="mb-3 text-sm uppercase tracking-[0.45em] text-zinc-500">
            Drag Champion
          </p>

          <h2 className="text-4xl font-black">🏆 Cole Kane</h2>

          <p className="mt-4 text-zinc-400">
            Hurtigste samlet tid i DarkLight Drag Racing prototype.
          </p>
        </div>
      </div>
    </section>
  );
}

function Driver({ name, winner }: { name: string; winner: boolean }) {
  return (
    <div
      className={`rounded-2xl px-4 py-4 ${
        winner
          ? "bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.18)]"
          : "bg-black text-zinc-400"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-black">{name}</span>
        <span className="text-sm font-black">{winner ? "WIN" : "—"}</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-3 last:border-b-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}