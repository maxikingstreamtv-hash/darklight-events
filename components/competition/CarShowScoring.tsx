"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const carShowResults = [
  {
    position: 1,
    owner: "Cole Kane",
    car: "Benefactor Schlagen GT",
    scores: {
      exterior: 24,
      interior: 23,
      originality: 25,
      details: 24,
      presentation: 25,
    },
  },
  {
    position: 2,
    owner: "Izadora Solis",
    car: "Nissan Skyline R34",
    scores: {
      exterior: 23,
      interior: 22,
      originality: 23,
      details: 24,
      presentation: 24,
    },
  },
  {
    position: 3,
    owner: "Alex Corleone",
    car: "Dinka Jester Classic",
    scores: {
      exterior: 22,
      interior: 21,
      originality: 22,
      details: 23,
      presentation: 23,
    },
  },
];

function totalScore(scores: {
  exterior: number;
  interior: number;
  originality: number;
  details: number;
  presentation: number;
}) {
  return (
    scores.exterior +
    scores.interior +
    scores.originality +
    scores.details +
    scores.presentation
  );
}

export default function CarShowScoring() {
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
              Car Show Scoring
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Bedømmelsessystem til carshows med point for eksteriør, interiør,
              originalitet, detaljer og præsentation.
            </p>
          </div>

          <Link
            href="/competition"
            className="w-fit rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-white hover:bg-white/10"
          >
            ← Tilbage
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {carShowResults.map((entry, index) => {
            const total = totalScore(entry.scores);

            return (
              <motion.article
                key={entry.owner}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                      Placering
                    </p>

                    <h2 className="mt-2 text-5xl font-black">
                      #{entry.position}
                    </h2>
                  </div>

                  <div className="rounded-full border border-white/10 bg-black px-5 py-3 text-xl font-black">
                    {total}
                  </div>
                </div>

                <h3 className="text-2xl font-black">{entry.owner}</h3>

                <p className="mt-2 text-zinc-500">{entry.car}</p>

                <div className="mt-7 rounded-2xl border border-white/10 bg-black p-5">
                  <ScoreLine label="Eksteriør" value={entry.scores.exterior} />
                  <ScoreLine label="Interiør" value={entry.scores.interior} />
                  <ScoreLine
                    label="Originalitet"
                    value={entry.scores.originality}
                  />
                  <ScoreLine label="Detaljer" value={entry.scores.details} />
                  <ScoreLine
                    label="Præsentation"
                    value={entry.scores.presentation}
                  />
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${(total / 125) * 100}%` }}
                  />
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
          <p className="mb-3 text-sm uppercase tracking-[0.45em] text-zinc-500">
            Car Show Winner
          </p>

          <h2 className="text-4xl font-black">🏆 Izadora Solis</h2>

          <p className="mt-4 text-zinc-400">
            Vinder af DarkLight Car Show prototype.
          </p>
        </div>
      </div>
    </section>
  );
}

function ScoreLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-3 last:border-b-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="font-black">{value}/25</span>
    </div>
  );
}