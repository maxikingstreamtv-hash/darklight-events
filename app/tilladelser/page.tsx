"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { EVENTOS_ADMIN_PERMISSION_STORAGE_KEY } from "@/components/competition/eventos-store";
import { permissions } from "@/data/permissions";

function readPermissions() {
  if (typeof window === "undefined") return permissions;

  try {
    const stored = JSON.parse(window.localStorage.getItem(EVENTOS_ADMIN_PERMISSION_STORAGE_KEY) ?? "null");
    return Array.isArray(stored) ? stored : permissions;
  } catch {
    return permissions;
  }
}

export default function TilladelserPage() {
  const publicPermissions = readPermissions();

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">Eventkoordinering</p>
          <h1 className="text-5xl font-black md:text-7xl">Tilladelser</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">Overblik over eventtilladelser, lokationer og status i DreamLight.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {publicPermissions.map((permission) => (
              <Link key={permission.id} href={`/tilladelser/${permission.id}`} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-white/30">
                <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-300">{permission.status}</span>
                <h2 className="mt-5 text-2xl font-black">{permission.event}</h2>
                <p className="mt-3 text-zinc-400">{permission.location}</p>
                <p className="mt-5 text-sm text-zinc-500">{permission.comment}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
