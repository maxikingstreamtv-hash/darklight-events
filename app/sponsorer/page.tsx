"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { EVENTOS_ADMIN_SPONSOR_STORAGE_KEY } from "@/components/competition/eventos-store";
import { sponsors } from "@/data/sponsors";

function readSponsors() {
  if (typeof window === "undefined") return sponsors;

  try {
    const stored = JSON.parse(window.localStorage.getItem(EVENTOS_ADMIN_SPONSOR_STORAGE_KEY) ?? "null");
    return Array.isArray(stored) ? stored : sponsors;
  } catch {
    return sponsors;
  }
}

export default function SponsorerPage() {
  const publicSponsors = readSponsors();

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">Partnere i DreamLight</p>
          <h1 className="text-5xl font-black md:text-7xl">Sponsorer</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">RP-partnere som støtter DarkLight-events med præmier, crew, lokationer og stemning.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {publicSponsors.map((sponsor) => (
              <Link key={sponsor.id} href={`/sponsorer/${sponsor.id}`} className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-white/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black text-xl font-black">{sponsor.logoInitials}</div>
                  <div>
                    <h2 className="text-2xl font-black">{sponsor.name}</h2>
                    <p className="mt-1 text-sm text-zinc-500">{sponsor.level} · {sponsor.status}</p>
                  </div>
                </div>
                <p className="mt-5 min-h-16 text-sm leading-6 text-zinc-400">{sponsor.description}</p>
                <p className="mt-5 text-sm font-black transition group-hover:translate-x-1">Se sponsor</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
