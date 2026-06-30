"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const raceResults = [
  {
    position: 1,
    driver: "Cole Kane",
    car: "Nissan GT-R",
    bestLap: "01:42.231",
    totalTime: "05:18.904",
    points: 25,
  },
  {
    position: 2,
    driver: "Izadora Solis",
    car: "Toyota Supra",
    bestLap: "01:43.008",
    totalTime: "05:21.440",
    points: 18,
  },
  {
    position: 3,
    driver: "Alex Corleone",
    car: "BMW M3",
    bestLap: "01:44.117",
    totalTime: "05:25.992",
    points: 15,
  },
  {
    position: 4,
    driver: "Lucas Storm",
    car: "Dodge Charger",
    bestLap: "01:45.884",
    totalTime: "05:31.102",
    points: 12,
  },
  {
    position: 5,
    driver: "Luna Fernandez",
    car: "Mazda RX-7",
    bestLap: "01:47.220",
    totalTime: "05:36.770",
    points: 10,
  },
];

export default function RaceLeaderboard() {
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
              Street Racing Leaderboard
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Resultatliste til race-events med kører, bil, bedste omgang,
              total tid og point.
            </p>
          </div>

          <Link
            href="/competition"
            className="w-fit rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-white hover:bg-white/10"
          >
            ← Tilbage
          </Link>
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="grid grid-cols-6 border-b border-white/10 bg-white/[0.06] px-6 py-5 text-sm font-black uppercase tracking-[0.25em] text-zinc-400">
            <div>Pos</div>
            <div className="col-span-2">Kører</div>
            <div>Bil</div>
            <div>Tid</div>
            <div className="text-right">Point</div>
          </div>

          {raceResults.map((result, index) => (
            <motion.div
              key={result.driver}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="grid grid-cols-6 items-center border-b border-white/10 px-6 py-6 last:border-b-0 hover:bg-white/[0.04]"
            >
              <div className="text-2xl font-black">
                #{result.position}
              </div>

              <div className="col-span-2">
                <p className="font-black">{result.driver}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Bedste omgang: {result.bestLap}
                </p>
              </div>

              <div className="text-zinc-300">{result.car}</div>

              <div>
                <p className="font-bold">{result.totalTime}</p>
                <p className="text-sm text-zinc-500">Total tid</p>
              </div>

              <div className="text-right text-2xl font-black">
                {result.points}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}