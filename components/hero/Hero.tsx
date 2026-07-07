"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useMockSession } from "@/components/auth/use-mock-session";
import ScrollIndicator from "./ScrollIndicator";

export default function Hero() {
  const session = useMockSession();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px] opacity-25" />

      <div className="absolute left-1/2 top-24 z-20 w-[min(92vw,500px)] -translate-x-1/2 lg:left-3 lg:translate-x-0 xl:left-6">
        <div className="rounded-xl border border-white/10 bg-black/75 px-4 py-3 shadow-[0_14px_38px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-200" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white">
                DreamLight RP
              </p>
              <p className="mt-1 text-[12px] leading-5 text-zinc-400">
                DarkLight Events er en officiel RP-eventorganisation på DreamLight FiveM Roleplay-serveren.
              </p>
              <p className="mt-1.5 text-[12px] leading-5 text-zinc-500">
                Alt indhold, events, ranglister, Hall of Fame, sponsorer og tilladelser på denne hjemmeside foregår udelukkende i DreamLight RP-universet.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <Image
          src="/logo.png"
          alt="DarkLight Events"
          width={430}
          height={430}
          priority
          style={{ height: "auto" }}
          className="mx-auto drop-shadow-[0_0_50px_rgba(255,255,255,0.35)] transition duration-700 hover:scale-[1.02]"
        />

        <p className="mt-8 text-sm uppercase tracking-[0.55em] text-zinc-500">
          Fra idé til oplevelse
        </p>

        <h1 className="mt-8 text-3xl font-black leading-tight md:text-5xl xl:text-6xl">
          DarkLight Events
          <br />
          <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            skaber DreamLights største oplevelser.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-4xl text-lg leading-8 text-zinc-300 md:text-xl">
          Vi planlægger biltræf, drift-turneringer, drag races, carshows,
          fester og store community-events for spillerne i DreamLight.
        </p>

        <div className="mt-12 flex flex-col justify-center gap-5 sm:flex-row">
          <Link
            href="/events"
            className="rounded-full bg-white px-10 py-4 font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.12)] transition duration-300 hover:-translate-y-1 hover:bg-zinc-300"
          >
            Se events
          </Link>

          <Link
            href={session ? "/profile" : "/login"}
            className="rounded-full border border-white/20 bg-white/[0.03] px-10 py-4 font-black text-white transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-black"
          >
            {session ? "Min profil" : "Log ind"}
          </Link>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl gap-5 md:grid-cols-4">
          <Stat value="10+" label="Eventtyper" />
          <Stat value="100%" label="FiveM fokus" />
          <Stat value="24H" label="Typisk svartid" />
          <Stat value="Uendeligt" label="Muligheder" />
        </div>
      </div>

      <ScrollIndicator />
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
      <h3 className="text-4xl font-black">{value}</h3>
      <p className="mt-3 text-sm text-zinc-500">{label}</p>
    </div>
  );
}

