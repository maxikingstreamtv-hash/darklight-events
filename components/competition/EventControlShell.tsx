"use client";

import Link from "next/link";
const sidebarLinks = [
  { href: "/competition", label: "Dashboard", icon: "DL" },
  { href: "/competition/control-center/tournaments", label: "Discipliner", icon: "DI" },
  { href: "/competition/drivers", label: "Kørere", icon: "K" },
  { href: "/competition/hall-of-fame", label: "Hall of Fame", icon: "HF" },
];

export default function EventControlShell() {
  return (
    <section className="min-h-screen bg-black px-6 py-28 text-white">
      <div className="mx-auto grid max-w-[1600px] gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl lg:sticky lg:top-28">
          <div className="mb-8 rounded-2xl border border-white/10 bg-black p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">DarkLight</p>
            <h2 className="mt-2 text-2xl font-black">Eventkontrol</h2>
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
              Manuelle eventdata. Staff kan styre events direkte fra EventOS.
            </p>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl md:p-10">
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              Eventkontrol
            </p>
            <h1 className="text-5xl font-black md:text-7xl">Dashboard</h1>
            <p className="mt-6 max-w-3xl text-zinc-400">
              Kontrolcenteret samler DarkLight Events scoreboards, brackets,
              deltagere, Hall of Fame og live-værktøjer ét sted.
            </p>
          </div>

          <Link href="/competition/control-center/tournaments" className="block rounded-2xl border border-white/10 bg-black p-5 transition hover:border-white/30">
            <h3 className="font-black">Databasedrevne discipliner</h3>
            <p className="mt-2 text-sm text-zinc-500">Se de aktive discipliner fra EventOS.</p>
          </Link>
        </main>
      </div>
    </section>
  );
}

