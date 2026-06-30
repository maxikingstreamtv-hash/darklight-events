"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const rounds = [
  {
    title: "Top 8",
    matches: [
      { left: "Cole Kane", right: "Lucas Storm", winner: "Cole Kane" },
      { left: "Izadora Solis", right: "Miklo Rodriguez", winner: "Izadora Solis" },
      { left: "Bo Fernandez", right: "Martin Jensen", winner: "Bo Fernandez" },
      { left: "Luna Fernandez", right: "Alex Corleone", winner: "Alex Corleone" },
    ],
  },
  {
    title: "Semifinale",
    matches: [
      { left: "Cole Kane", right: "Izadora Solis", winner: "Cole Kane" },
      { left: "Bo Fernandez", right: "Alex Corleone", winner: "Alex Corleone" },
    ],
  },
  {
    title: "Finale",
    matches: [
      { left: "Cole Kane", right: "Alex Corleone", winner: "Cole Kane" },
    ],
  },
];

export default function DriftBracket() {
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
              Drift Championship
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Prototype bracket til drift-events. Senere kan den kobles på
              Firebase, så vindere og point kan opdateres live.
            </p>
          </div>

          <Link
            href="/competition"
            className="w-fit rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-white hover:bg-white/10"
          >
            ← Tilbage
          </Link>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="grid min-w-[950px] gap-8 lg:grid-cols-3">
            {rounds.map((round, roundIndex) => (
              <div key={round.title}>
                <div className="mb-6 rounded-full border border-white/10 bg-black px-5 py-3 text-center">
                  <p className="text-sm font-black uppercase tracking-[0.35em] text-zinc-400">
                    {round.title}
                  </p>
                </div>

                <div
                  className={`flex flex-col ${
                    roundIndex === 0
                      ? "gap-6"
                      : roundIndex === 1
                      ? "gap-24 pt-16"
                      : "gap-6 pt-40"
                  }`}
                >
                  {round.matches.map((match, index) => (
                    <motion.div
                      key={`${match.left}-${match.right}`}
                      initial={{ opacity: 0, x: -25 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: roundIndex * 0.15 + index * 0.08,
                        duration: 0.5,
                      }}
                      className="relative rounded-2xl border border-white/10 bg-black p-4"
                    >
                      <PlayerRow
                        name={match.left}
                        active={match.winner === match.left}
                      />

                      <div className="my-3 h-px bg-white/10" />

                      <PlayerRow
                        name={match.right}
                        active={match.winner === match.right}
                      />

                      {roundIndex < rounds.length - 1 && (
                        <div className="absolute right-[-34px] top-1/2 hidden h-px w-8 bg-white/20 lg:block" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
          <p className="mb-3 text-sm uppercase tracking-[0.45em] text-zinc-500">
            Champion
          </p>

          <h2 className="text-4xl font-black">🏆 Cole Kane</h2>

          <p className="mt-4 text-zinc-400">
            Vinder af DarkLight Drift Championship prototype.
          </p>
        </div>
      </div>
    </section>
  );
}

function PlayerRow({ name, active }: { name: string; active: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3 ${
        active ? "bg-white text-black" : "bg-white/[0.04] text-zinc-400"
      }`}
    >
      <span className="font-bold">{name}</span>

      <span className="text-sm">{active ? "WIN" : "—"}</span>
    </div>
  );
}