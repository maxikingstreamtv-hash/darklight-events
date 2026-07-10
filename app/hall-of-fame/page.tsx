"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { findAvailableDriver } from "@/components/auth/driver-directory";
import { useEventOSStore } from "@/components/competition/eventos-store";
import { getActiveVehicle } from "@/components/competition/garage-engine";

function getDriverName(driverId?: string) {
  if (!driverId) return "Afventer";
  return findAvailableDriver(driverId)?.name ?? "Ukendt kører";
}

function getDriverVehicle(driverId?: string) {
  if (!driverId) return "Ingen bil endnu";
  const vehicle = getActiveVehicle(driverId);
  return vehicle ? vehicle.model : "Ukendt bil";
}

export default function PublicHallOfFamePage() {
  const { hallOfFameWinners } = useEventOSStore();

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight spillerportal</p>
              <h1 className="text-5xl font-black md:text-7xl">Hall of Fame</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">
                Officiel eventhistorik vises først, når DarkLight staff manuelt offentliggør officielle vindere.
              </p>
            </div>
            <Link href="/leaderboard" className="w-fit rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 font-black text-zinc-200 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black">
              Se rangliste
            </Link>
          </div>

          {hallOfFameWinners.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {hallOfFameWinners.map((winner) => (
                <article key={winner.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
                  <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Offentliggjort P{winner.placement}</p>
                  <h2 className="mt-4 text-3xl font-black">{getDriverName(winner.driverId)}</h2>
                  <p className="mt-3 text-zinc-400">{winner.eventId}</p>
                  <p className="mt-4 rounded-full border border-white/10 bg-black px-4 py-2 text-sm font-black text-zinc-300">{getDriverVehicle(winner.driverId)}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Ren start</p>
              <h2 className="mt-4 text-3xl font-black">Ingen officielle vindere endnu</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
                DarkLight Events starter uden tidligere champions, podier eller historiske sejre.
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

