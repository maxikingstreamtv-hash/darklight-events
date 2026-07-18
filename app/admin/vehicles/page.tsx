import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { AdminCard, Field, StatusBadge, fieldClassName } from "@/components/admin/AdminUi";
import { prisma } from "@/lib/prisma";
import { canManageVehicles, requireVehicleReader } from "@/lib/admin/vehicle-access";
import {
  addChecklistTemplateItemAction,
  createChecklistTemplateAction,
  removeChecklistTemplateItemAction,
  updateChecklistTemplateItemAction,
} from "./actions";

type SearchParams = {
  q?: string | string[];
  owner?: string | string[];
  status?: string | string[];
  vehicleClass?: string | string[];
  eventCategory?: string | string[];
  inspectionStatus?: string | string[];
  ok?: string | string[];
  error?: string | string[];
};

type VehicleRow = {
  id: string;
  displayName: string;
  licensePlate: string | null;
  vehicleClass: string | null;
  eventCategory: string | null;
  status: string;
  owner: { id: string; displayName: string; username: string };
  inspections: { status: string; createdAt: Date }[];
};

type TemplateItemRow = {
  id: string;
  category: string;
  label: string;
  description: string | null;
  required: boolean;
  sortOrder: number;
};

type TemplateRow = {
  id: string;
  name: string;
  description: string | null;
  items: TemplateItemRow[];
};

const vehicleStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
const inspectionStatuses = ["PENDING", "IN_PROGRESS", "APPROVED", "REJECTED"] as const;

type VehicleStatusValue = (typeof vehicleStatuses)[number];
type InspectionStatusValue = (typeof inspectionStatuses)[number];

function param(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function readVehicleStatus(value: string): VehicleStatusValue | null {
  return vehicleStatuses.includes(value as VehicleStatusValue) ? (value as VehicleStatusValue) : null;
}

function readInspectionStatus(value: string): InspectionStatusValue | null {
  return inspectionStatuses.includes(value as InspectionStatusValue) ? (value as InspectionStatusValue) : null;
}

function CategoryOptions() {
  return (
    <>
      <option value="PERFORMANCE">Performance</option>
      <option value="ENGINE">Motor og ydelse</option>
      <option value="SAFETY">Sikkerhed</option>
      <option value="DOCUMENTS">Dokumenter</option>
      <option value="REQUIRED_EQUIPMENT">Obligatorisk udstyr</option>
      <option value="EXTERIOR">Karrosseri</option>
      <option value="OTHER">Andet</option>
    </>
  );
}

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireVehicleReader();
  const canManage = canManageVehicles(user);
  const params = await searchParams;
  const q = param(params.q).trim();
  const owner = param(params.owner);
  const status = param(params.status);
  const vehicleClass = param(params.vehicleClass).trim();
  const eventCategory = param(params.eventCategory).trim();
  const inspectionStatus = param(params.inspectionStatus);
  const statusFilter = readVehicleStatus(status);
  const inspectionStatusFilter = readInspectionStatus(inspectionStatus);
  const ok = param(params.ok);
  const error = param(params.error);

  const where = {
    ...(q
      ? {
          OR: [
            { displayName: { contains: q, mode: "insensitive" as const } },
            { modelName: { contains: q, mode: "insensitive" as const } },
            { licensePlate: { contains: q, mode: "insensitive" as const } },
            { vehicleClass: { contains: q, mode: "insensitive" as const } },
            { eventCategory: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(owner ? { ownerId: owner } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(vehicleClass ? { vehicleClass: { contains: vehicleClass, mode: "insensitive" as const } } : {}),
    ...(eventCategory ? { eventCategory: { contains: eventCategory, mode: "insensitive" as const } } : {}),
    ...(inspectionStatusFilter ? { inspections: { some: { status: inspectionStatusFilter } } } : {}),
  };

  const [vehicles, owners, templates] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        displayName: true,
        licensePlate: true,
        vehicleClass: true,
        eventCategory: true,
        status: true,
        owner: { select: { id: true, displayName: true, username: true } },
        inspections: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, createdAt: true } },
      },
    }),
    prisma.user.findMany({ orderBy: { displayName: "asc" }, select: { id: true, displayName: true, username: true } }),
    prisma.vehicleChecklistTemplate.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        items: {
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          select: {
            id: true,
            category: true,
            label: true,
            description: true,
            required: true,
            sortOrder: true,
          },
        },
      },
    }),
  ]);

  return (
    <AdminShell
      eyebrow="VehicleOS"
      title="Køretøjer"
      action={canManage ? <Link href="/admin/vehicles/create" className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">Tildel køretøj</Link> : null}
    >
      <div className="grid gap-5">
        {ok ? <Message tone="ok" text={ok} /> : null}
        {error ? <Message tone="error" text={error} /> : null}

        <AdminCard>
          <form action="/admin/vehicles" className="grid gap-4 lg:grid-cols-[1fr_190px_150px_150px_160px_190px_auto]">
            <input name="q" defaultValue={q} className="field" placeholder="Søg efter navn, model eller nummerplade" />
            <select name="owner" defaultValue={owner} className="field">
              <option value="">Alle ejere</option>
              {owners.map((item: { id: string; displayName: string; username: string }) => (
                <option key={item.id} value={item.id}>{item.displayName}</option>
              ))}
            </select>
            <select name="status" defaultValue={status} className="field">
              <option value="">Alle statusser</option>
              <option value="ACTIVE">Aktiv</option>
              <option value="INACTIVE">Inaktiv</option>
              <option value="SUSPENDED">Suspenderet</option>
            </select>
            <input name="vehicleClass" defaultValue={vehicleClass} className="field" placeholder="Køretøjsklasse" />
            <input name="eventCategory" defaultValue={eventCategory} className="field" placeholder="Eventkategori" />
            <select name="inspectionStatus" defaultValue={inspectionStatus} className="field">
              <option value="">Alle inspektioner</option>
              <option value="PENDING">Afventer</option>
              <option value="IN_PROGRESS">I gang</option>
              <option value="APPROVED">Godkendt</option>
              <option value="REJECTED">Afvist</option>
            </select>
            <button className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">Filtrer</button>
          </form>
        </AdminCard>

        {canManage ? (
          <AdminCard>
            <h2 className="text-2xl font-black">Checklist templates</h2>
            <p className="mt-2 text-sm text-zinc-400">Opret og vedligehold genbrugelige baselines til inspektioner.</p>
            <form action={createChecklistTemplateAction} className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <Field label="Navn">
                <input name="templateName" className={fieldClassName} placeholder="Standard eventkontrol" />
              </Field>
              <Field label="Beskrivelse">
                <input name="templateDescription" className={fieldClassName} placeholder="Motor, sikkerhed, dokumenter og udstyr" />
              </Field>
              <button className="self-end rounded-full bg-white px-6 py-4 font-black text-black transition hover:bg-zinc-300">Gem template</button>
            </form>
            <div className="mt-6 grid gap-4">
              {templates.length === 0 ? <p className="text-sm text-zinc-500">Ingen templates endnu.</p> : templates.map((template: TemplateRow) => (
                <div key={template.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{template.name}</h3>
                      <p className="mt-1 text-xs text-zinc-500">{template.description ?? "Ingen beskrivelse"} · {template.items.length} punkter</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">Template</span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {template.items.map((item: TemplateItemRow) => (
                      <form key={item.id} action={updateChecklistTemplateItemAction.bind(null, template.id, item.id)} className="grid gap-3 rounded-xl border border-white/10 p-3 lg:grid-cols-[160px_1fr_1fr_120px_auto]">
                        <select name="category" defaultValue={item.category} className="field">
                          <CategoryOptions />
                        </select>
                        <input name="label" defaultValue={item.label} className="field" placeholder="Punkt" />
                        <input name="description" defaultValue={item.description ?? ""} className="field" placeholder="Beskrivelse" />
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
                          <input name="required" type="checkbox" defaultChecked={item.required} /> Krævet
                        </label>
                        <div className="flex gap-2">
                          <button className="rounded-full bg-white px-4 py-2 text-xs font-black text-black transition hover:bg-zinc-300">Gem</button>
                          <button formAction={removeChecklistTemplateItemAction.bind(null, template.id, item.id)} className="rounded-full border border-red-400/30 px-4 py-2 text-xs font-black text-red-200 transition hover:bg-red-400 hover:text-black">Fjern</button>
                        </div>
                      </form>
                    ))}
                    <form action={addChecklistTemplateItemAction.bind(null, template.id)} className="grid gap-3 rounded-xl border border-dashed border-white/15 p-3 lg:grid-cols-[160px_1fr_1fr_120px_auto]">
                      <select name="category" className="field">
                        <CategoryOptions />
                      </select>
                      <input name="label" className="field" placeholder="Nyt punkt" />
                      <input name="description" className="field" placeholder="Beskrivelse" />
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
                        <input name="required" type="checkbox" defaultChecked /> Krævet
                      </label>
                      <button className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-200 transition hover:bg-white hover:text-black">Tilføj punkt</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        ) : null}

        <AdminCard className="overflow-hidden">
          {vehicles.length === 0 ? (
            <div className="py-10 text-center">
              <h2 className="text-2xl font-black">Ingen køretøjer fundet</h2>
              <p className="mt-3 text-sm text-zinc-400">Tildel et køretøj eller juster filtrene.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  <tr className="border-b border-white/10">
                    <th className="pb-4">Køretøj</th>
                    <th className="pb-4">Ejer</th>
                    <th className="pb-4">Køretøjsklasse</th>
                    <th className="pb-4">Eventkategori</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Seneste inspektion</th>
                    <th className="pb-4 text-right">Handling</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle: VehicleRow) => {
                    const latest = vehicle.inspections[0];
                    return (
                      <tr key={vehicle.id} className="border-b border-white/10 last:border-0">
                        <td className="py-4">
                          <p className="font-black">{vehicle.displayName}</p>
                          <p className="mt-1 text-xs text-zinc-500">{vehicle.licensePlate ?? "Ingen plade"}</p>
                        </td>
                        <td className="py-4 text-zinc-300">{vehicle.owner.displayName}</td>
                        <td className="py-4 text-zinc-300">{vehicle.vehicleClass ?? "Ikke angivet"}</td>
                        <td className="py-4 text-zinc-300">{vehicle.eventCategory ?? "Ikke angivet"}</td>
                        <td className="py-4"><StatusBadge tone={vehicle.status === "ACTIVE" ? "strong" : "neutral"}>{vehicle.status}</StatusBadge></td>
                        <td className="py-4 text-zinc-300">{latest?.status ?? "Ingen inspektion"}</td>
                        <td className="py-4 text-right">
                          <Link href={`/admin/vehicles/${vehicle.id}`} className="rounded-full border border-white/10 px-4 py-2 font-black text-zinc-200 transition hover:bg-white hover:text-black">Åbn</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>
    </AdminShell>
  );
}

function Message({ tone, text }: { tone: "ok" | "error"; text: string }) {
  return <div className={`rounded-2xl border px-5 py-4 text-sm ${tone === "ok" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-red-400/20 bg-red-400/10 text-red-200"}`}>{text}</div>;
}
