"use client";

import Link from "next/link";

export default function DragLadder() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              Konkurrencecenter
            </p>

            <h1 className="text-4xl font-black md:text-6xl">
              Drag Race ladder
            </h1>

            <p className="mt-5 max-w-2xl text-zinc-400">
              Drag-system til heats, semifinaler og finaler med reaktionstid,
              sluttid og topfart.
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
          <h2 className="mt-4 text-3xl font-black">Ingen drag ladder resultater endnu</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
            Drag vindere, tider og brackets oprettes først, når staff indtaster og godkender
            manuelle tidsresultater under et event.
          </p>
        </div>
      </div>
    </section>
  );
}

