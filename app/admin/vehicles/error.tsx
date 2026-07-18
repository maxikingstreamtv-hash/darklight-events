"use client";

import { AdminCard } from "@/components/admin/AdminUi";

export default function VehiclesError({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">VehicleOS</p>
        <h1 className="mb-8 text-5xl font-black">Køretøjer</h1>
        <AdminCard>
          <h2 className="text-2xl font-black">Køretøjer kunne ikke indlæses</h2>
          <p className="mt-3 text-sm text-zinc-400">Prøv igen, eller tjek databaseforbindelsen.</p>
          <button onClick={reset} className="mt-6 rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">Prøv igen</button>
        </AdminCard>
      </div>
    </main>
  );
}
