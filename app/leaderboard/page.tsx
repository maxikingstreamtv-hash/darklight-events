"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveLeaderboard from "@/components/competition/LiveLeaderboard";

export default function PublicLeaderboardPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight spillerportal</p>
              <h1 className="text-5xl font-black md:text-7xl">Rangliste</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">
                Ranglisten opdateres løbende, når DarkLight staff godkender resultater fra events.
              </p>
            </div>
            <Link href="/events" className="w-fit rounded-full border border-white/15 px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
              Se events
            </Link>
          </div>

          <LiveLeaderboard title="Officiel live rangliste" />
        </div>
      </section>
      <Footer />
    </main>
  );
}

