"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CompetitionType } from "@/data/competition";

export default function CompetitionCard({
  competition,
  index,
}: {
  competition: CompetitionType;
  index: number;
}) {
  const isReady = competition.status === "Klar";

  return (
    <motion.article
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 text-white backdrop-blur-xl"
    >
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/20" />

      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black text-3xl">
          {competition.icon}
        </div>

        <span
          className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${
            isReady
              ? "border-white/30 bg-white/10 text-white"
              : "border-white/10 bg-black text-zinc-500"
          }`}
        >
          {competition.status}
        </span>
      </div>

      <p className="mb-3 text-sm uppercase tracking-[0.35em] text-zinc-500">
        {competition.subtitle}
      </p>

      <h2 className="text-3xl font-black">{competition.title}</h2>

      <p className="mt-4 min-h-20 text-sm leading-7 text-zinc-400">
        {competition.description}
      </p>

      {isReady ? (
        <Link
          href={competition.href}
          className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-black text-black transition hover:scale-105 hover:bg-zinc-300"
        >
          Åbn turnering
        </Link>
      ) : (
        <button
          disabled
          className="mt-8 inline-flex cursor-not-allowed rounded-full border border-white/10 px-6 py-3 font-black text-zinc-600"
        >
          Ikke aktiv endnu
        </button>
      )}
    </motion.article>
  );
}

