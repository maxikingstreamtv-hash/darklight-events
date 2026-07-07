"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSessionDriver } from "@/components/auth/driver-directory";
import { useMockSession } from "@/components/auth/use-mock-session";
import DriverCareerProfile from "@/components/driver/DriverCareerProfile";

export default function DriverPortalPage() {
  const session = useMockSession();
  const activeDriver = getSessionDriver(session);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight spillerportal</p>
              <h1 className="text-5xl font-black md:text-7xl">Profil</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">
                Karriere, garage, trofæer og præstationer beregnes fra godkendte EventOS-resultater.
              </p>
            </div>
            <Link href="/events" className="w-fit rounded-full border border-white/15 px-6 py-3 font-black text-zinc-200 transition hover:border-white/40 hover:bg-white hover:text-black">
              Se events
            </Link>
          </div>

          <DriverCareerProfile driver={activeDriver} />
        </div>
      </section>
      <Footer />
    </main>
  );
}

