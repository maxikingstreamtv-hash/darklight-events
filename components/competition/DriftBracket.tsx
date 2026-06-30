"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const rounds = [
  {
    title: "Top 32",
    matches: [
      { left: "Cole Kane", right: "Lucas Storm", winner: "Cole Kane" },
      { left: "Izadora Solis", right: "Miklo Rodriguez", winner: "Izadora Solis" },
      { left: "Bo Fernandez", right: "Martin Jensen", winner: "Bo Fernandez" },
      { left: "Luna Fernandez", right: "Alex Corleone", winner: "Alex Corleone" },
      { left: "Mark Klit", right: "Gabriella Wilson", winner: "Gabriella Wilson" },
      { left: "Ana Rose", right: "Tom Andersen", winner: "Ana Rose" },
      { left: "Kevin Anderson", right: "Lydia Hansen", winner: "Kevin Anderson" },
      { left: "Buga Sánches", right: "Phillip Jensen", winner: "Phillip Jensen" },
    ],
  },
  {
    title: "Top 16",
    matches: [
      { left: "Cole Kane", right: "Izadora Solis", winner: "Cole Kane" },
      { left: "Bo Fernandez", right: "Alex Corleone", winner: "Alex Corleone" },
      { left: "Gabriella Wilson", right: "Ana Rose", winner: "Ana Rose" },
      { left: "Kevin Anderson", right: "Phillip Jensen", winner: "Kevin Anderson" },
    ],
  },
  {
    title: "Top 8",
    matches: [
      { left: "Cole Kane", right: "Alex Corleone", winner: "Cole Kane" },
      { left: "Ana Rose", right: "Kevin Anderson", winner: "Ana Rose" },
    ],
  },
  {
    title: "Finale",
    matches: [
      { left: "Cole Kane", right: "Ana Rose", winner: "Cole Kane" },
    ],
  },
];

export default function DriftBracket() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_40%)]" />

      <div className="relative mx-auto max-w-[1600px]">
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              Competition Center
            </p>

            <h1 className="text-4xl font-black md:text-6xl">
              Drift Championship Bracket
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Prototype turneringstavle til drift-events. Senere kan vindere,
              point og deltagere styres live via admin-panel.
            </p>
          </div>

          <Link
            href="/competition"
            className="w-fit rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-white hover:bg-white/10"
          >
            ← Tilbage
          </Link>
        </div>

        <div className="overflow-x-auto rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="grid min-w-[1400px] grid-cols-4 gap-10">
            {rounds.map((round, roundIndex) => (
              <div key={round.title}>
                <div className="mb-8 rounded-full border border-white/10 bg-black px-5 py-3 text-center">
                  <p className="text-sm font-black uppercase tracking-[0.35em] text-zinc-400">
                    {round.title}
                  </p>
                </div>

                <div
                  className={`flex flex-col ${
                    roundIndex === 0
                      ? "gap-4"
                      : roundIndex === 1
                      ? "gap-14 pt-10"
                      : roundIndex === 2
                      ? "gap-36 pt-28"
                      : "gap-6 pt-72"
                  }`}
                >
                  {round.matches.map((match, index) => (
                    <motion.div
                      key={`${round.title}-${match.left}-${match.right}`}
                      initial={{ opacity: 0, x: -25 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: roundIndex * 0.15 + index * 0.05,
                        duration: 0.5,
                      }}
                      className="relative rounded-2xl border border-white/10 bg-black p-4 shadow-[0_0_30px_rgba(255,255,255,0.04)]"
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
                        <>
                          <div className="absolute right-[-42px] top-1/2 hidden h-px w-10 bg-white/25 lg:block" />
                          <div className="absolute right-[-42px] top-1/2 hidden h-16 w-px -translate-y-8 bg-white/10 lg:block" />
                        </>
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
            Vinder af DarkLight Drift Championship.
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
        active
          ? "bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.18)]"
          : "bg-white/[0.04] text-zinc-400"
      }`}
    >
      <span className="font-bold">{name}</span>
      <span className="text-sm font-black">{active ? "WIN" : "—"}</span>
    </div>
  );
}