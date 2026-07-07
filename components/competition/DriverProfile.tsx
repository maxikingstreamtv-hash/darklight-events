"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEventOSStore } from "@/components/competition/eventos-store";
import { getDriverStats } from "@/components/competition/result-engine";
import { Driver } from "@/data/drivers";

export default function DriverCard({ driver }: { driver: Driver }) {
  const { results } = useEventOSStore();
  const stats = getDriverStats(results, driver.id);
  const winRate = stats.eventsParticipated > 0 ? Math.round((stats.wins / stats.eventsParticipated) * 100) : 0;

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl"
    >
      <div className="border-b border-white/10 p-8 text-center">
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-black text-3xl font-black">
          {driver.name.split(" ").map((word) => word[0]).join("")}
        </div>

        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{driver.darklightId}</p>
        <h2 className="mt-3 text-2xl font-black">{driver.name}</h2>
        <p className="mt-2 text-zinc-500">{driver.role}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6">
        <Stat title="Point" value={stats.totalPoints} />
        <Stat title="Events" value={stats.eventsParticipated} />
        <Stat title="Sejre" value={stats.wins} />
        <Stat title="Podier" value={stats.podiums} />
      </div>

      <div className="border-t border-white/10 px-6 py-5">
        <div className="mb-3 flex justify-between text-sm">
          <span className="text-zinc-500">Sejrsrate</span>
          <span className="font-bold">{winRate}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${winRate}%` }} />
        </div>

        <Link href={`/competition/drivers/${driver.id}`} className="mt-6 inline-flex w-full justify-center rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
          Åbn profil
        </Link>
      </div>
    </motion.article>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4 text-center">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-zinc-500">{title}</p>
    </div>
  );
}

