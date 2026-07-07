"use client";

import Link from "next/link";

export default function RaceLeaderboard() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">Konkurrencecenter</p>

            <h1 className="text-4xl font-black md:text-6xl">Street Racing rangliste</h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Resultatliste til race-events med kører, bil, bedste omgang,
              total tid og point.
            </p>
          </div>

          <Link
            href="/competition"
            className="w-fit rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-white hover:bg-white/10"
          >
            Tilbage
          </Link>
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Ren start</p>
          <h2 className="mt-4 text-3xl font-black">Ingen race-rangliste endnu</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
            Race, drag og offroad sorterer laveste sluttid bedst, efter staff har indtastet
            og godkendt manuelle tidsresultater.
          </p>
        </div>
      </div>
    </section>
  );
}

