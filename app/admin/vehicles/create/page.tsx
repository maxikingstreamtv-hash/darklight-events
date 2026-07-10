import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { AdminCard, Field, fieldClassName } from "@/components/admin/AdminUi";
import { prisma } from "@/lib/prisma";
import { requireVehicleManager } from "@/lib/admin/vehicle-access";
import { createVehicleAction } from "../actions";

function param(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

export default async function CreateVehiclePage({ searchParams }: { searchParams: Promise<{ ownerId?: string | string[]; error?: string | string[] }> }) {
  await requireVehicleManager();
  const params = await searchParams;
  const ownerId = param(params.ownerId);
  const error = param(params.error);
  const users = await prisma.user.findMany({ orderBy: { displayName: "asc" }, select: { id: true, displayName: true, username: true } });

  return (
    <AdminShell eyebrow="VehicleOS" title="Tildel køretøj" action={<Link href="/admin/vehicles" className="rounded-full border border-white/10 px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">Tilbage</Link>}>
      <AdminCard>
        {error ? <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">{error}</div> : null}
        <form action={createVehicleAction} className="grid gap-5 lg:grid-cols-2">
          <Field label="Ejer">
            <select name="ownerId" defaultValue={ownerId} className={fieldClassName} required>
              <option value="">Vælg bruger</option>
              {users.map((user: { id: string; displayName: string; username: string }) => <option key={user.id} value={user.id}>{user.displayName} · @{user.username}</option>)}
            </select>
          </Field>
          <Field label="Køretøjsnavn">
            <input name="displayName" className={fieldClassName} placeholder="Elegy Retro Custom" required />
          </Field>
          <Field label="Modelnavn">
            <input name="modelName" className={fieldClassName} placeholder="Sultan RS" />
          </Field>
          <Field label="Spawncode">
            <input name="spawnCode" className={fieldClassName} placeholder="sultanrs" />
          </Field>
          <Field label="Nummerplade">
            <input name="licensePlate" className={fieldClassName} placeholder="DL-001" />
          </Field>
          <Field label="Klasse">
            <input name="vehicleClass" className={fieldClassName} placeholder="Drift / Race / Show" />
          </Field>
          <Field label="Status">
            <select name="status" className={fieldClassName} defaultValue="ACTIVE">
              <option value="ACTIVE">Aktiv</option>
              <option value="INACTIVE">Inaktiv</option>
              <option value="SUSPENDED">Suspenderet</option>
            </select>
          </Field>
          <Field label="Billede URL">
            <input name="imageUrl" className={fieldClassName} placeholder="Valgfrit" />
          </Field>
          <Field label="Beskrivelse">
            <textarea name="description" className={fieldClassName} rows={4} placeholder="RP-note om køretøjet" />
          </Field>
          <div className="lg:col-span-2">
            <button className="rounded-full bg-white px-7 py-4 font-black text-black transition hover:bg-zinc-300">Tildel køretøj</button>
          </div>
        </form>
      </AdminCard>
    </AdminShell>
  );
}
