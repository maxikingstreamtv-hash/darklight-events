"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getAchievementXP, getAchievements } from "@/components/achievement-engine";
import { getSessionDriver } from "@/components/auth/driver-directory";
import { useMockSession } from "@/components/auth/use-mock-session";
import { useEventOSStore } from "@/components/competition/eventos-store";
import { vehicles } from "@/data/vehicles";

export default function AchievementsPage() {
  const { results } = useEventOSStore();
  const session = useMockSession();
  const activeDriver = getSessionDriver(session);
  const achievements = getAchievements(activeDriver, results, vehicles);
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
  const achievementXP = getAchievementXP(activeDriver, results, vehicles);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight spillerportal</p>
              <h1 className="text-5xl font-black md:text-7xl">Præstationer</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">
                Præstationer låses kun op af godkendte EventOS-resultater. Ingen historik vises før de første rigtige events.
              </p>
            </div>
            <Link href="/profile" className="w-fit rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 font-black text-zinc-200 transition duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white hover:text-black">
              Til profil
            </Link>
          </div>

          <div className="mb-8 grid gap-5 md:grid-cols-3">
            <Stat title="Låst op" value={`${unlockedCount}/${achievements.length}`} />
            <Stat title="Præstations-XP" value={achievementXP} />
            <Stat title="Kilde" value="Godkendte" />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {achievements.map((achievement) => {
              const progressPercent = Math.min(Math.round((achievement.progress / achievement.target) * 100), 100);

              return (
                <article key={achievement.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{achievement.category}</p>
                      <h2 className="mt-3 text-2xl font-black">{achievement.title}</h2>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${achievement.unlocked ? "bg-green-500/20 text-green-400" : "bg-white/10 text-zinc-400"}`}>
                      {achievement.unlocked ? "Låst op" : "Låst"}
                    </span>
                  </div>
                  <p className="min-h-12 text-sm leading-6 text-zinc-400">{achievement.description}</p>
                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
                    <span>{achievement.progress}/{achievement.target}</span>
                    <span className="font-black text-zinc-300">+{achievement.xpReward} XP</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-4xl font-black">{value}</p>
    </div>
  );
}

