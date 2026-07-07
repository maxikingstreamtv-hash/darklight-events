"use client";

import Link from "next/link";
import DriverCard from "@/components/competition/DriverCard";
import { drivers } from "@/data/drivers";

export default function DriversOverview() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              Eventkontrol
            </p>

            <h1 className="text-4xl font-black md:text-6xl">
              DarkLight ID oversigt
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Her samles deltagere, profiler og statistikker, så DarkLight staff
              hurtigt kan finde kørere før og under events.
            </p>
          </div>

          <Link
            href="/competition"
            className="w-fit rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-white hover:bg-white/10"
          >
            ← Tilbage
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {drivers.map((driver) => (
            <DriverCard key={driver.id} driver={driver} />
          ))}
        </div>
      </div>
    </section>
  );
}

