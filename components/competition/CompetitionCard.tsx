"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type DisciplineCardData = {
  id: string;
  name: string;
  description: string;
  abbreviation: string;
  category: string | null;
  upcomingEvents: number;
  completedEvents: number;
};

export default function CompetitionCard({ discipline, index }: { discipline: DisciplineCardData; index: number }) {
  return (
    <motion.article initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08, duration: 0.5 }} whileHover={{ y: -6 }} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 text-white backdrop-blur-xl">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/20" />
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black text-xl font-black">{discipline.abbreviation}</div>
        <span className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-bold text-zinc-400">{discipline.upcomingEvents} kommende</span>
      </div>
      <p className="mb-3 text-sm uppercase tracking-[0.25em] text-zinc-500">{discipline.category ?? "Disciplin"}</p>
      <h2 className="text-3xl font-black">{discipline.name}</h2>
      <p className="mt-4 min-h-20 text-sm leading-7 text-zinc-400">{discipline.description}</p>
      <p className="mt-4 text-xs font-bold text-zinc-500">{discipline.completedEvents} afsluttede events</p>
      <Link href={`/competition?discipline=${discipline.id}`} className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">Se disciplin</Link>
    </motion.article>
  );
}
