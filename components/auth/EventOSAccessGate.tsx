"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { hasEventOSAccess } from "@/components/auth/mock-auth";
import { useMockSession } from "@/components/auth/use-mock-session";

export default function EventOSAccessGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const session = useMockSession();

  if (pathname === "/competition") {
    return <>{children}</>;
  }

  if (!hasEventOSAccess(session)) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-2xl rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">DarkLight EventOS</p>
          <h1 className="mt-4 text-5xl font-black">Log ind for at fortsætte</h1>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-zinc-400">
            EventOS er for DarkLight staff. Log ind som Cole Kane eller Izadora Solis
            for fuld adgang til eventværktøjer, heat control, resultater og administration.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black p-5 text-left">
            <p className="font-black">Manuelle eventdata</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Data styres manuelt af DarkLight staff i denne version.
            </p>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300"
            >
              Åbn login
            </Link>
            <Link
              href="/events"
              className="rounded-full border border-white/15 px-6 py-3 font-black text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              Offentlige events
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

