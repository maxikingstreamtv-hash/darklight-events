"use client";

import Link from "next/link";
import { use } from "react";
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

export default function SponsorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sponsor = readSponsors().find((item) => item.id === id);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <Link href="/sponsorer" className="text-sm font-black text-zinc-400 transition hover:text-white">Tilbage til sponsorer</Link>
          {sponsor ? (
            <>
              <div className="mt-8 flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-black text-2xl font-black">{sponsor.logoInitials}</div>
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">{sponsor.level}</p>
                  <h1 className="text-5xl font-black">{sponsor.name}</h1>
                </div>
              </div>
              <p className="mt-6 leading-7 text-zinc-300">{sponsor.description}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Info label="Kontaktperson" value={sponsor.contactPerson} />
                <Info label="Status" value={sponsor.status} />
                <Info label="Partner siden" value={sponsor.partnerSince} />
                <Info label="Events" value={sponsor.eventsSupported.join(", ")} />
              </div>
            </>
          ) : (
            <div className="mt-8">
              <h1 className="text-4xl font-black">Sponsor ikke fundet</h1>
              <p className="mt-4 text-zinc-400">Sponsoren findes ikke i den offentlige partnerliste.</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black p-5"><p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p><p className="mt-2 font-black">{value}</p></div>;
}
