import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { AdminCard, Field, StatusBadge, fieldClassName } from "@/components/admin/AdminUi";
import { prisma } from "@/lib/prisma";
import { canManageVehicles, requireVehicleReader } from "@/lib/admin/vehicle-access";
import {
  addChecklistItemAction,
  createInspectionAction,
  deactivateVehicleAction,
  removeChecklistItemAction,
  updateChecklistItemAction,
  updateInspectionStatusAction,
  updateVehicleAction,
} from "../actions";

type SearchParams = { ok?: string | string[]; error?: string | string[] };
type ChecklistItem = {
  id: string;
  category: string;
  label: string;
  description: string | null;
  result: string;
  required: boolean;
  sortOrder: number;
  adminNote: string | null;
};
type Inspection = {
  id: string;
  title: string;
  notes: string | null;
  status: string;
  inspectedAt: Date | null;
  inspectedBy: { displayName: string } | null;
  items: ChecklistItem[];
};

const categories = ["ENGINE", "SAFETY", "DOCUMENTS", "REQUIRED_EQUIPMENT", "EXTERIOR", "OTHER"] as const;
const results = ["NOT_CHECKED", "APPROVED", "REJECTED", "NOT_APPLICABLE"] as const;

function param(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

export default async function VehicleDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  const reader = await requireVehicleReader();
  const canManage = canManageVehicles(reader);
  const { id } = await params;
  const query = await searchParams;
  const ok = param(query.ok);
  const error = param(query.error);

  const [vehicle, templates] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, displayName: true, username: true } },
        inspections: {
          orderBy: { createdAt: "desc" },
          include: {
            inspectedBy: { select: { displayName: true } },
            items: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
          },
        },
      },
    }),
    prisma.vehicleChecklistTemplate.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!vehicle) {
    notFound();
  }

  return (
    <AdminShell eyebrow="VehicleOS" title={vehicle.displayName} action={<Link href="/admin/vehicles" className="rounded-full border border-white/10 px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">Tilbage</Link>}>
      <div className="grid gap-6">
        {ok ? <Message tone="ok" text={ok} /> : null}
        {error ? <Message tone="error" text={error} /> : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <AdminCard>
            <div className="mb-5 flex flex-wrap gap-2">
              <StatusBadge tone={vehicle.status === "ACTIVE" ? "strong" : "neutral"}>{vehicle.status}</StatusBadge>
              <span className="rounded-full border border-white/10 bg-black px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-zinc-300">{vehicle.owner.displayName}</span>
            </div>
            <form action={updateVehicleAction.bind(null, vehicle.id)} className="grid gap-5 lg:grid-cols-2">
              <Field label="Køretøjsnavn"><input name="displayName" defaultValue={vehicle.displayName} className={fieldClassName} disabled={!canManage} /></Field>
              <Field label="Modelnavn"><input name="modelName" defaultValue={vehicle.modelName ?? ""} className={fieldClassName} disabled={!canManage} /></Field>
              <Field label="Spawncode"><input name="spawnCode" defaultValue={vehicle.spawnCode ?? ""} className={fieldClassName} disabled={!canManage} /></Field>
              <Field label="Nummerplade"><input name="licensePlate" defaultValue={vehicle.licensePlate ?? ""} className={fieldClassName} disabled={!canManage} /></Field>
              <Field label="Klasse"><input name="vehicleClass" defaultValue={vehicle.vehicleClass ?? ""} className={fieldClassName} disabled={!canManage} /></Field>
              <Field label="Status">
                <select name="status" defaultValue={vehicle.status} className={fieldClassName} disabled={!canManage}>
                  <option value="ACTIVE">Aktiv</option>
                  <option value="INACTIVE">Inaktiv</option>
                  <option value="SUSPENDED">Suspenderet</option>
                </select>
              </Field>
              <Field label="Billede URL"><input name="imageUrl" defaultValue={vehicle.imageUrl ?? ""} className={fieldClassName} disabled={!canManage} /></Field>
              <Field label="Beskrivelse"><textarea name="description" defaultValue={vehicle.description ?? ""} className={fieldClassName} rows={4} disabled={!canManage} /></Field>
              {canManage ? (
                <div className="flex flex-wrap gap-3 lg:col-span-2">
                  <button className="rounded-full bg-white px-7 py-4 font-black text-black transition hover:bg-zinc-300">Gem køretøj</button>
                </div>
              ) : null}
            </form>
          </AdminCard>

          <AdminCard>
            <h2 className="text-2xl font-black">Handlinger</h2>
            <p className="mt-3 text-sm text-zinc-400">Event Managers har læseadgang. Kun Admin og Super Admin kan ændre data.</p>
            {canManage ? (
              <form action={deactivateVehicleAction.bind(null, vehicle.id)} className="mt-5">
                <button className="rounded-full border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">Deaktiver køretøj</button>
              </form>
            ) : null}
          </AdminCard>
        </div>

        {canManage ? (
          <AdminCard>
            <h2 className="text-2xl font-black">Opret inspektion</h2>
            <form action={createInspectionAction.bind(null, vehicle.id)} className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input name="title" className="field" placeholder="Eventklar kontrol" />
              <input name="notes" className="field" placeholder="Noter" />
              <select name="templateId" className="field">
                <option value="">Uden template</option>
                {templates.map((template: { id: string; name: string }) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </select>
              <button className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">Opret</button>
            </form>
          </AdminCard>
        ) : null}

        {vehicle.inspections.length === 0 ? (
          <AdminCard>
            <h2 className="text-2xl font-black">Ingen inspektioner endnu</h2>
            <p className="mt-3 text-sm text-zinc-400">Opret en inspektion for at begynde checklisten.</p>
          </AdminCard>
        ) : (
          vehicle.inspections.map((inspection: Inspection) => (
            <AdminCard key={inspection.id}>
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <h2 className="text-2xl font-black">{inspection.title}</h2>
                  <p className="mt-2 text-sm text-zinc-400">{inspection.notes ?? "Ingen noter."}</p>
                  <div className="mt-4"><StatusBadge tone={inspection.status === "APPROVED" ? "strong" : inspection.status === "REJECTED" ? "warn" : "neutral"}>{inspection.status}</StatusBadge></div>
                </div>
                {canManage ? (
                  <form action={updateInspectionStatusAction.bind(null, vehicle.id, inspection.id)} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <select name="status" defaultValue={inspection.status} className="field">
                      <option value="PENDING">Afventer</option>
                      <option value="IN_PROGRESS">I gang</option>
                      <option value="APPROVED">Godkendt</option>
                      <option value="REJECTED">Afvist</option>
                    </select>
                    <input name="notes" defaultValue={inspection.notes ?? ""} className="field" placeholder="Inspektionsnote" />
                    <button className="rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">Gem status</button>
                  </form>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4">
                {inspection.items.length === 0 ? <p className="text-sm text-zinc-500">Ingen checklist-punkter endnu.</p> : inspection.items.map((item: ChecklistItem) => (
                  <form key={item.id} action={updateChecklistItemAction.bind(null, vehicle.id, item.id)} className="grid gap-3 rounded-2xl border border-white/10 bg-black p-4 lg:grid-cols-[150px_1fr_150px_120px_90px]">
                    <select name="category" defaultValue={item.category} className="field" disabled={!canManage}>
                      {categories.map((category: (typeof categories)[number]) => <option key={category} value={category}>{category}</option>)}
                    </select>
                    <input name="label" defaultValue={item.label} className="field" disabled={!canManage} />
                    <select name="result" defaultValue={item.result} className="field" disabled={!canManage}>
                      {results.map((result: (typeof results)[number]) => <option key={result} value={result}>{result}</option>)}
                    </select>
                    <input name="sortOrder" defaultValue={item.sortOrder} className="field" disabled={!canManage} />
                    <label className="flex items-center gap-2 text-sm text-zinc-300"><input name="required" type="checkbox" defaultChecked={item.required} disabled={!canManage} /> Krav</label>
                    <input name="description" defaultValue={item.description ?? ""} className="field lg:col-span-2" placeholder="Beskrivelse" disabled={!canManage} />
                    <input name="adminNote" defaultValue={item.adminNote ?? ""} className="field lg:col-span-2" placeholder="Admin note" disabled={!canManage} />
                    {canManage ? (
                      <div className="flex gap-2">
                        <button className="rounded-full bg-white px-4 py-2 font-black text-black">Gem</button>
                        <button formAction={removeChecklistItemAction.bind(null, vehicle.id, item.id)} className="rounded-full border border-white/10 px-4 py-2 font-black text-zinc-200">Fjern</button>
                      </div>
                    ) : null}
                  </form>
                ))}
              </div>

              {canManage ? (
                <form action={addChecklistItemAction.bind(null, vehicle.id, inspection.id)} className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[150px_1fr_150px_120px_90px]">
                  <select name="category" className="field">
                    {categories.map((category: (typeof categories)[number]) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  <input name="label" className="field" placeholder="Nyt checklist-punkt" />
                  <select name="result" className="field" defaultValue="NOT_CHECKED">
                    {results.map((result: (typeof results)[number]) => <option key={result} value={result}>{result}</option>)}
                  </select>
                  <input name="sortOrder" className="field" placeholder="10" />
                  <label className="flex items-center gap-2 text-sm text-zinc-300"><input name="required" type="checkbox" defaultChecked /> Krav</label>
                  <input name="description" className="field lg:col-span-2" placeholder="Beskrivelse" />
                  <input name="adminNote" className="field lg:col-span-2" placeholder="Admin note" />
                  <button className="rounded-full bg-white px-4 py-2 font-black text-black">Tilføj</button>
                </form>
              ) : null}
            </AdminCard>
          ))
        )}
      </div>
    </AdminShell>
  );
}

function Message({ tone, text }: { tone: "ok" | "error"; text: string }) {
  return <div className={`rounded-2xl border px-5 py-4 text-sm ${tone === "ok" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-red-400/20 bg-red-400/10 text-red-200"}`}>{text}</div>;
}
