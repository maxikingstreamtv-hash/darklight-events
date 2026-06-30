"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Driver } from "@/data/drivers";

export default function DriverProfile({ driver }: { driver: Driver }) {
  const nextLevelXp = 4000;
  const xpPercent = Math.min((driver.stats.xp / nextLevelXp) * 100, 100);

  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10">
          <Link
            href="/competition"
            className="rounded-full border border-white/20 px-6 py-3 font-bold transition hover:border-white hover:bg-white/10"
          >
            ← Tilbage
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl"
          >
            <div className="mx-auto mb-8 flex h-40 w-40 items-center justify-center rounded-full border border-white/10 bg-black text-5xl font-black">
              {driver.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>

            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-zinc-500">
              DarkLight ID
            </p>

            <h1 className="text-4xl font-black">{driver.name}</h1>

            <p className="mt-3 text-zinc-400">{driver.role}</p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black p-5">
              <p className="text-3xl font-black">{driver.darklightId}</p>
              <p className="mt-2 text-sm text-zinc-500">Official Competitor ID</p>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black p-5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Level</span>
                <span className="font-black">{driver.stats.level}</span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-zinc-500">
                {driver.stats.xp} / {nextLevelXp} XP
              </p>
            </div>
          </motion.div>

          <div className="space-y-8">
            <div className="grid gap-5 md:grid-cols-4">
              <Stat label="Events" value={driver.stats.events} />
              <Stat label="Wins" value={driver.stats.wins} />
              <Stat label="Podiums" value={driver.stats.podiums} />
              <Stat
                label="Win Rate"
                value={`${Math.round(
                  (driver.stats.wins / driver.stats.events) * 100
                )}%`}
              />
            </div>

            <Panel title="Ratings">
              <Rating label="Drift" value={driver.ratings.drift} />
              <Rating label="Race" value={driver.ratings.race} />
              <Rating label="Drag" value={driver.ratings.drag} />
              <Rating label="Car Show" value={driver.ratings.carshow} />
              <Rating label="Motocross" value={driver.ratings.motocross} />
              <Rating label="Derby" value={driver.ratings.derby} />
            </Panel>

            <Panel title="Achievements">
              <div className="grid gap-3 md:grid-cols-2">
                {driver.achievements.map((achievement) => (
                  <div
                    key={achievement}
                    className="rounded-2xl border border-white/10 bg-black p-4 font-bold"
                  >
                    {achievement}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Vehicles">
              <div className="rounded-2xl border border-white/10 bg-black p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                  Favorite Vehicle
                </p>

                <p className="mt-3 text-2xl font-black">
                  {driver.favoriteVehicle}
                </p>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl"
    >
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{label}</p>
    </motion.div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
      <h2 className="mb-6 text-2xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function Rating({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-zinc-400">{label}</span>
        <span className="font-black">{value}</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-white" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}