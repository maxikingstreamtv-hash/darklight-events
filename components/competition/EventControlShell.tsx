"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { competitions } from "@/data/competition";
import { drivers } from "@/data/drivers";

const sidebarLinks = [
  { href: "/competition", label: "Dashboard", icon: "⌘" },
  { href: "/competition/drift", label: "Drift", icon: "💨" },
  { href: "/competition/race", label: "Race", icon: "🏁" },
  { href: "/competition/drag", label: "Drag", icon: "🚀" },
  { href: "/competition/carshow", label: "Car Show", icon: "🚗" },
  { href: "/competition/drivers", label: "Drivers", icon: "👤" },
  { href: "/competition/hall-of-fame", label: "Hall of Fame", icon: "🏆" },
];

const stats = [
  { label: "Aktive Events", value: "0", text: "Live system senere" },
  { label: "Discipliner", value: "13", text: "Scoreboards og brackets" },
  { label: "Drivers", value: "3", text: "DarkLight ID profiler" },
  { label: "Live TV", value: "Soon", text: "OBS / storskærm" },
];

export default function EventControlShell() {
  return (
    <section className="min-h-screen bg-black px-6 py-28 text-white">
      <div className="mx-auto grid max-w-[1600px] gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl lg:sticky lg:top-28">
          <div className="mb-8 rounded-2xl border border-white/10 bg-black p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
              DarkLight
            </p>
            <h2 className="mt-2 text-2xl font-black">Event Control</h2>
          </div>

          <nav className="space-y-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-zinc-400 transition hover:bg-white hover:text-black"
              >
                <span>{link.icon}</span>
                <span className="font-bold">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black p-5">
            <p className="text-sm text-zinc-500">
              Public prototype. Staff panel, Firebase og live updates kommer
              senere.
            </p>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl md:p-10">
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              Event Control Center
            </p>

            <h1 className="text-5xl font-black md:text-7xl">
              Dashboard
            </h1>

            <p className="mt-6 max-w-3xl text-zinc-400">
              Kontrolcenteret samler DarkLight Events scoreboards, brackets,
              deltagere, Hall of Fame og fremtidige live-værktøjer ét sted.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                  {stat.label}
                </p>
                <p className="mt-4 text-4xl font-black">{stat.value}</p>
                <p className="mt-3 text-sm text-zinc-400">{stat.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-3 text-sm uppercase tracking-[0.35em] text-zinc-500">
                    Scoreboards
                  </p>
                  <h2 className="text-3xl font-black">Discipliner</h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {competitions.map((competition) => (
                  <Link
                    key={competition.id}
                    href={competition.href}
                    className="group rounded-2xl border border-white/10 bg-black p-5 transition hover:-translate-y-1 hover:border-white/30"
                  >
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <span className="text-3xl">{competition.icon}</span>

                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">
                        {competition.status}
                      </span>
                    </div>

                    <h3 className="font-black">{competition.title}</h3>
                    <p className="mt-2 text-sm text-zinc-500">
                      {competition.subtitle}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
                <p className="mb-3 text-sm uppercase tracking-[0.35em] text-zinc-500">
                  Drivers
                </p>
                <h2 className="text-3xl font-black">Seneste profiler</h2>

                <div className="mt-6 space-y-3">
                  {drivers.map((driver) => (
                    <Link
                      key={driver.id}
                      href={`/competition/drivers/${driver.id}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black p-4 transition hover:border-white/30"
                    >
                      <div>
                        <p className="font-black">{driver.name}</p>
                        <p className="text-sm text-zinc-500">
                          {driver.darklightId}
                        </p>
                      </div>

                      <span className="font-black">LVL {driver.level}</span>
                    </Link>
                  ))}
                </div>

                <Link
                  href="/competition/drivers"
                  className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300"
                >
                  Åbn Drivers →
                </Link>
              </div>

              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
                <p className="mb-3 text-sm uppercase tracking-[0.35em] text-zinc-500">
                  Live
                </p>
                <h2 className="text-3xl font-black">TV Mode</h2>
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  Fremtidig live-visning til OBS, Discord streams og storskærme.
                </p>

                <Link
                  href="/competition/live"
                  className="mt-6 inline-flex rounded-full border border-white/20 px-6 py-3 font-black transition hover:border-white hover:bg-white/10"
                >
                  Kommer snart →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}