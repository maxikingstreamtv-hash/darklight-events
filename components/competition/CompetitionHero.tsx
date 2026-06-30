"use client";

import { motion } from "framer-motion";

export default function CompetitionHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-black px-6 py-28 text-white">
      {/* Baggrundsglow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5 text-sm uppercase tracking-[0.45em] text-zinc-500"
        >
          DarkLight Events
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-black md:text-7xl"
        >
          Competition Center
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-400"
        >
          Her finder du turneringer, resultater, brackets og kommende
          konkurrencer arrangeret af DarkLight Events. Formålet er at give
          deltagere og tilskuere et samlet overblik over alle konkurrencer.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm">
            💨 Drift
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm">
            🏁 Race
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm">
            🚀 Drag
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm">
            🚗 Car Show
          </span>
        </motion.div>
      </div>
    </section>
  );
}