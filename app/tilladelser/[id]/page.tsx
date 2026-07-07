"use client";

import Link from "next/link";
import { use } from "react";
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

export default function TilladelseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const permission = readPermissions().find((item) => item.id === id);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <Link href="/tilladelser" className="text-sm font-black text-zinc-400 transition hover:text-white">Tilbage til tilladelser</Link>
          {permission ? (
            <>
              <h1 className="mt-8 text-5xl font-black">{permission.event}</h1>
              <p className="mt-4 text-zinc-400">{permission.comment}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Info label="Status" value={permission.status} />
                <Info label="Lokation" value={permission.location} />
                <Info label="Ansøger" value={permission.applicant} />
                <Info label="Koordinering" value={permission.authority} />
              </div>
            </>
          ) : (
            <div className="mt-8">
              <h1 className="text-4xl font-black">Tilladelse ikke fundet</h1>
              <p className="mt-4 text-zinc-400">Tilladelsen findes ikke i den offentlige oversigt.</p>
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
