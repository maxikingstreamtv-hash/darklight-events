"use client";

import AdminShell from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminUi";

export default function VehiclesError({ reset }: { reset: () => void }) {
  return (
    <AdminShell eyebrow="VehicleOS" title="Køretøjer">
      <AdminCard>
        <h2 className="text-2xl font-black">Køretøjer kunne ikke indlæses</h2>
        <p className="mt-3 text-sm text-zinc-400">Prøv igen, eller tjek databaseforbindelsen.</p>
        <button onClick={reset} className="mt-6 rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">Prøv igen</button>
      </AdminCard>
    </AdminShell>
  );
}
