import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  Camera,
  Car,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Gauge,
  ImageIcon,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminCard, Field, fieldClassName } from "@/components/admin/AdminUi";
import InspectionReportPreview from "@/components/vehicles/InspectionReportPreview";
import { prisma } from "@/lib/prisma";
import { canManageVehicles, requireVehicleReader } from "@/lib/admin/vehicle-access";
import {
  addChecklistItemAction,
  createInspectionAction,
  deactivateVehicleAction,
  moveChecklistItemAction,
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
  createdAt: Date;
  inspectedBy: { displayName: string; avatar: string | null } | null;
  items: ChecklistItem[];
};

const categories = ["PERFORMANCE", "ENGINE", "SAFETY", "DOCUMENTS", "REQUIRED_EQUIPMENT", "EXTERIOR", "OTHER"] as const;
const results = ["NOT_CHECKED", "APPROVED", "REJECTED", "NOT_APPLICABLE"] as const;

const categoryLabels: Record<string, string> = {
  PERFORMANCE: "Performance",
  ENGINE: "Motor",
  SAFETY: "Sikkerhed",
  DOCUMENTS: "Dokumentation",
  REQUIRED_EQUIPMENT: "Udstyr",
  EXTERIOR: "Eksteriør",
  OTHER: "Generelt",
};

function param(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function formatDate(value: Date | null | undefined) {
  if (!value) return "Ikke registreret";
  return new Intl.DateTimeFormat("da-DK", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

function badgeMeta(status: string) {
  if (status === "ACTIVE" || status === "APPROVED") return { label: status === "ACTIVE" ? "Godkendt" : "Approved", tone: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200", icon: CheckCircle2 };
  if (status === "PENDING") return { label: "Pending inspection", tone: "border-yellow-300/30 bg-yellow-300/10 text-yellow-100", icon: Clock3 };
  if (status === "IN_PROGRESS") return { label: "Under inspektion", tone: "border-blue-400/30 bg-blue-400/10 text-blue-200", icon: Gauge };
  if (status === "REJECTED" || status === "SUSPENDED") return { label: status === "SUSPENDED" ? "Afvist" : "Rejected", tone: "border-red-400/30 bg-red-400/10 text-red-200", icon: XCircle };
  if (status === "INACTIVE") return { label: "Inaktiv", tone: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300", icon: Archive };
  return { label: status, tone: "border-white/10 bg-white/5 text-zinc-300", icon: AlertTriangle };
}

function completion(items: ChecklistItem[]) {
  const relevant = items.filter((item: ChecklistItem) => item.result !== "NOT_APPLICABLE");
  if (relevant.length === 0) return 0;
  return Math.round((relevant.filter((item: ChecklistItem) => item.result === "APPROVED").length / relevant.length) * 100);
}

function groupItems(items: ChecklistItem[]) {
  return categories
    .map((category: (typeof categories)[number]) => ({
      category,
      label: categoryLabels[category],
      items: items.filter((item: ChecklistItem) => item.category === category),
    }))
    .filter((group: { items: ChecklistItem[] }) => group.items.length > 0);
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
        owner: { select: { id: true, displayName: true, username: true, avatar: true } },
        createdBy: { select: { displayName: true, avatar: true } },
        inspections: {
          orderBy: { createdAt: "desc" },
          include: {
            inspectedBy: { select: { displayName: true, avatar: true } },
            items: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
          },
        },
      },
    }),
    prisma.vehicleChecklistTemplate.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!vehicle) notFound();

  const latestInspection = vehicle.inspections[0] as Inspection | undefined;
  const latestCompletion = latestInspection ? completion(latestInspection.items) : 0;
  const vehicleBadge = badgeMeta(vehicle.status);
  const inspectionBadge = badgeMeta(latestInspection?.status ?? "PENDING");
  const VehicleIcon = vehicleBadge.icon;
  const InspectionIcon = inspectionBadge.icon;
  const completedInspections = vehicle.inspections.filter((inspection: Inspection) => inspection.status === "APPROVED" || inspection.status === "REJECTED");
  const adminNotes = vehicle.inspections.flatMap((inspection: Inspection) =>
    inspection.items
      .filter((item: ChecklistItem) => item.adminNote)
      .map((item: ChecklistItem) => ({ inspection: inspection.title, label: item.label, note: item.adminNote ?? "" })),
  );

  return (
    <AdminShell eyebrow="VehicleOS" title={vehicle.displayName} action={<Link href="/admin/vehicles" className="rounded-full border border-white/10 px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">Tilbage</Link>}>
      <div className="grid gap-6">
        {ok ? <Message tone="ok" text={ok} /> : null}
        {error ? <Message tone="error" text={error} /> : null}

        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.045] shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="grid gap-0 xl:grid-cols-[420px_1fr_320px]">
            <div className="relative min-h-[340px] bg-neutral-950">
              {vehicle.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vehicle.imageUrl} alt={vehicle.displayName} className="h-full w-full object-cover" />
              ) : (
                <VehiclePlaceholder />
              )}
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <StatusPill status={vehicle.status} />
                <StatusPill status={latestInspection?.status ?? "PENDING"} />
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <div className="flex flex-wrap gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${vehicleBadge.tone}`}>
                  <VehicleIcon className="h-4 w-4" /> {vehicleBadge.label}
                </span>
                <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${inspectionBadge.tone}`}>
                  <InspectionIcon className="h-4 w-4" /> {inspectionBadge.label}
                </span>
              </div>
              <h1 className="mt-6 text-5xl font-black leading-none">{vehicle.displayName}</h1>
              <p className="mt-4 text-sm text-zinc-500">
                {vehicle.licensePlate ?? "Ingen plade"} / {vehicle.vehicleClass ?? "Ikke angivet"} / {vehicle.eventCategory ?? "Ikke angivet"}
              </p>
              {vehicle.description ? <p className="mt-6 text-base leading-8 text-zinc-300">{vehicle.description}</p> : null}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <InfoTile label="Ejer" value={`${vehicle.owner.displayName} / @${vehicle.owner.username}`} />
                <InfoTile label="Køretøjsklasse" value={vehicle.vehicleClass ?? "Ikke angivet"} />
                <InfoTile label="Eventkategori" value={vehicle.eventCategory ?? "Ikke angivet"} />
                <InfoTile label="Oprettet" value={formatDate(vehicle.createdAt)} />
                <InfoTile label="Opdateret" value={formatDate(vehicle.updatedAt)} />
                <InfoTile label="Administrator" value={vehicle.createdBy.displayName} />
              </div>
            </div>

            <aside className="border-t border-white/10 p-6 xl:border-l xl:border-t-0">
              <h2 className="text-2xl font-black">Quick stats</h2>
              <div className="mt-5 grid gap-3">
                <Metric icon={<ClipboardCheck />} label="Inspektioner" value={`${vehicle.inspections.length}`} />
                <Metric icon={<ShieldCheck />} label="Checklist" value={`${latestCompletion}%`} />
                <Metric icon={<Gauge />} label="Status" value={vehicleBadge.label} />
                <Metric icon={<UserRound />} label="Inspektør" value={latestInspection?.inspectedBy?.displayName ?? "Ikke tildelt"} />
              </div>
            </aside>
          </div>
        </section>

        {canManage ? (
          <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <AdminCard>
              <h2 className="mb-5 text-2xl font-black">Rediger køretøj</h2>
              <form action={updateVehicleAction.bind(null, vehicle.id)} className="grid gap-5 lg:grid-cols-2">
                <Field label="Køretøjsnavn"><input name="displayName" defaultValue={vehicle.displayName} className={fieldClassName} /></Field>
                <Field label="Modelnavn"><input name="modelName" defaultValue={vehicle.modelName ?? ""} className={fieldClassName} /></Field>
                <Field label="Nummerplade"><input name="licensePlate" defaultValue={vehicle.licensePlate ?? ""} className={fieldClassName} /></Field>
                <Field label="Køretøjsklasse"><input name="vehicleClass" defaultValue={vehicle.vehicleClass ?? ""} className={fieldClassName} placeholder="Fx B, A, S eller S+" /></Field>
                <Field label="Eventkategori"><input name="eventCategory" defaultValue={vehicle.eventCategory ?? ""} className={fieldClassName} placeholder="Fx Drift, Race, Drag eller Car Show" /></Field>
                <Field label="Status">
                  <select name="status" defaultValue={vehicle.status} className={fieldClassName}>
                    <option value="ACTIVE">Godkendt</option>
                    <option value="INACTIVE">Inaktiv</option>
                    <option value="SUSPENDED">Afvist</option>
                  </select>
                </Field>
                <Field label="Køretøjsbillede URL">
                  <input name="imageUrl" defaultValue={vehicle.imageUrl ?? ""} className={fieldClassName} placeholder="https://..." />
                </Field>
                <Field label="Beskrivelse"><textarea name="description" defaultValue={vehicle.description ?? ""} className={fieldClassName} rows={4} /></Field>
                <div className="flex flex-wrap gap-3 lg:col-span-2">
                  <button className="rounded-full bg-white px-7 py-4 font-black text-black transition hover:bg-zinc-300">Gem køretøj</button>
                </div>
              </form>
            </AdminCard>

            <AdminCard>
              <h2 className="text-2xl font-black">Handlinger</h2>
              <p className="mt-3 text-sm text-zinc-400">Kun Admin og Super Admin kan ændre køretøjsdata. Event Managers har læseadgang.</p>
              <form action={deactivateVehicleAction.bind(null, vehicle.id)} className="mt-5">
                <button className="rounded-full border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">Arkivér / deaktiver</button>
              </form>
            </AdminCard>
          </section>
        ) : null}

        {canManage ? (
          <AdminCard>
            <h2 className="text-2xl font-black">Opret inspektion</h2>
            <form action={createInspectionAction.bind(null, vehicle.id)} className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input name="title" className="field" placeholder="Eventklar kontrol" />
              <input name="notes" className="field" placeholder="Privat inspektionsnote" />
              <select name="templateId" className="field">
                <option value="">Uden template</option>
                {templates.map((template: { id: string; name: string }) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </select>
              <button className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">Opret</button>
            </form>
          </AdminCard>
        ) : null}

        {latestInspection ? (
          <InspectionReportPreview
            title={`${latestInspection.title} / ${vehicle.displayName}`}
            subtitle="Rapportkomponenten samler status, inspektør og checklist-data, så PDF-generering senere kan kobles på uden nyt dataflow."
            items={[
              { label: "Resultat", value: latestInspection.status },
              { label: "Inspektør", value: latestInspection.inspectedBy?.displayName ?? "Ikke tildelt" },
              { label: "Dato", value: formatDate(latestInspection.inspectedAt ?? latestInspection.createdAt) },
              { label: "Checklist", value: `${latestCompletion}%` },
            ]}
          />
        ) : null}

        <section className="grid gap-6">
          {vehicle.inspections.length === 0 ? (
            <AdminCard>
              <h2 className="text-2xl font-black">Ingen inspektioner endnu</h2>
              <p className="mt-3 text-sm text-zinc-400">Opret en inspektion for at begynde checklisten.</p>
            </AdminCard>
          ) : (
            vehicle.inspections.map((inspection: Inspection) => (
              <AdminCard key={inspection.id}>
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">Inspection software</p>
                    <h2 className="mt-3 text-3xl font-black">{inspection.title}</h2>
                    <p className="mt-2 text-sm text-zinc-400">{inspection.notes ?? "Ingen noter."}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <StatusPill status={inspection.status} />
                      <span className="text-sm text-zinc-500">Completion: {completion(inspection.items)}%</span>
                      {inspection.inspectedBy ? <Inspector user={inspection.inspectedBy} /> : null}
                    </div>
                  </div>
                  {canManage ? (
                    <form action={updateInspectionStatusAction.bind(null, vehicle.id, inspection.id)} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                      <select name="status" defaultValue={inspection.status} className="field">
                        <option value="PENDING">Afventer</option>
                        <option value="IN_PROGRESS">I gang</option>
                        <option value="APPROVED">Godkendt</option>
                        <option value="REJECTED">Afvist</option>
                      </select>
                      <input name="notes" defaultValue={inspection.notes ?? ""} className="field" placeholder="Inspektørnote" />
                      <button className="rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">Gem status</button>
                    </form>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-4">
                  {inspection.items.length === 0 ? <p className="text-sm text-zinc-500">Ingen checklist-punkter endnu.</p> : groupItems(inspection.items).map((group) => (
                    <details key={group.category} open className="rounded-[1.5rem] border border-white/10 bg-black/70 p-4">
                      <summary className="cursor-pointer list-none">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-black">{group.label}</h3>
                            <p className="mt-1 text-xs text-zinc-500">{group.items.length} punkter / {completion(group.items)}% færdig</p>
                          </div>
                          <StatusPill status={completion(group.items) === 100 ? "APPROVED" : "PENDING"} />
                        </div>
                      </summary>
                      <div className="mt-4 grid gap-3">
                        {group.items.map((item: ChecklistItem, index: number) => (
                          <ChecklistRow key={item.id} item={item} vehicleId={vehicle.id} canManage={canManage} index={index} max={group.items.length} />
                        ))}
                      </div>
                    </details>
                  ))}
                </div>

                {canManage ? (
                  <form action={addChecklistItemAction.bind(null, vehicle.id, inspection.id)} className="mt-5 grid gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 lg:grid-cols-[160px_1fr_160px_120px_auto]">
                    <select name="category" className="field">
                      {categories.map((category: (typeof categories)[number]) => <option key={category} value={category}>{categoryLabels[category]}</option>)}
                    </select>
                    <input name="label" className="field" placeholder="Nyt checklist-punkt" />
                    <select name="result" className="field" defaultValue="NOT_CHECKED">
                      {results.map((result: (typeof results)[number]) => <option key={result} value={result}>{result}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-sm text-zinc-300"><input name="required" type="checkbox" defaultChecked /> Krævet</label>
                    <button className="rounded-full bg-white px-4 py-2 font-black text-black">Tilføj punkt</button>
                    <input name="description" className="field lg:col-span-2" placeholder="Beskrivelse" />
                    <input name="adminNote" className="field lg:col-span-2" placeholder="Privat admin note" />
                  </form>
                ) : null}
              </AdminCard>
            ))
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <AdminCard>
            <h2 className="text-2xl font-black">Inspektionshistorik</h2>
            <div className="mt-5 grid gap-3">
              {completedInspections.length === 0 ? <p className="text-sm text-zinc-500">Ingen færdige inspektioner endnu.</p> : completedInspections.map((inspection: Inspection, index: number) => (
                <div key={inspection.id} className="rounded-2xl border border-white/10 bg-black/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black">{inspection.title}</h3>
                      <p className="mt-1 text-xs text-zinc-500">{formatDate(inspection.inspectedAt ?? inspection.createdAt)} / version {completedInspections.length - index}</p>
                    </div>
                    <StatusPill status={inspection.status} />
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">Inspektør: {inspection.inspectedBy?.displayName ?? "Ikke registreret"} / Køretøjsstatus: {vehicleBadge.label}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Åbn rapport senere via PDF-modul</p>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="text-2xl font-black">Dokumenter</h2>
            <div className="mt-5 grid gap-3">
              <DocumentItem icon={<FileText />} title="Inspektionsrapport" text="Klar til fremtidig PDF-generering." />
              <DocumentItem icon={<Camera />} title="Køretøjsbillede" text={vehicle.imageUrl ? "Billede er tilknyttet profilen." : "Intet billede tilknyttet endnu."} />
              <DocumentItem icon={<ImageIcon />} title="Fremtidige uploads" text="Ekstra billeder og PDF-filer kan kobles på samme sektion senere." />
            </div>
          </AdminCard>
        </section>

        {canManage ? (
          <AdminCard>
            <h2 className="text-2xl font-black">Private admin notes</h2>
            <div className="mt-5 grid gap-3">
              {adminNotes.length === 0 ? <p className="text-sm text-zinc-500">Ingen private admin-noter på checklisten endnu.</p> : adminNotes.map((note) => (
                <div key={`${note.inspection}-${note.label}`} className="rounded-2xl border border-white/10 bg-black/70 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{note.inspection} / {note.label}</p>
                  <p className="mt-2 text-sm text-zinc-300">{note.note}</p>
                </div>
              ))}
            </div>
          </AdminCard>
        ) : null}
      </div>
    </AdminShell>
  );
}

function ChecklistRow({ item, vehicleId, canManage, index, max }: { item: ChecklistItem; vehicleId: string; canManage: boolean; index: number; max: number }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <form action={updateChecklistItemAction.bind(null, vehicleId, item.id)} className="grid gap-3 lg:grid-cols-[150px_1fr_150px_110px_auto]">
        <select name="category" defaultValue={item.category} className="field" disabled={!canManage}>
          {categories.map((category: (typeof categories)[number]) => <option key={category} value={category}>{categoryLabels[category]}</option>)}
        </select>
        <input name="label" defaultValue={item.label} className="field" disabled={!canManage} />
        <select name="result" defaultValue={item.result} className="field" disabled={!canManage}>
          {results.map((result: (typeof results)[number]) => <option key={result} value={result}>{result}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-zinc-300"><input name="required" type="checkbox" defaultChecked={item.required} disabled={!canManage} /> Krævet</label>
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full bg-white px-4 py-2 font-black text-black">Gem</button>
            <button formAction={removeChecklistItemAction.bind(null, vehicleId, item.id)} className="rounded-full border border-white/10 px-4 py-2 font-black text-zinc-200">Fjern</button>
          </div>
        ) : null}
        <input name="description" defaultValue={item.description ?? ""} className="field lg:col-span-2" placeholder="Beskrivelse" disabled={!canManage} />
        <input name="adminNote" defaultValue={item.adminNote ?? ""} className="field lg:col-span-2" placeholder="Privat admin note" disabled={!canManage} />
      </form>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex flex-wrap gap-2">
          <StatusPill status={item.result} />
          <span className="rounded-full border border-white/10 bg-black px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
            {item.result === "APPROVED" ? "Completed" : item.result === "REJECTED" ? "Failed" : item.result === "NOT_APPLICABLE" ? "Ikke relevant" : "Not checked"}
          </span>
          <span className="rounded-full border border-white/10 bg-black px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-zinc-400">Timestamp: næste statuslog</span>
        </div>
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <form action={moveChecklistItemAction.bind(null, vehicleId, item.id, "up")}>
              <button disabled={index === 0} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-200 transition hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-40">Flyt op</button>
            </form>
            <form action={moveChecklistItemAction.bind(null, vehicleId, item.id, "down")}>
              <button disabled={index === max - 1} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-200 transition hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-40">Flyt ned</button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const meta = badgeMeta(status);
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] ${meta.tone}`}>
      <Icon className="h-3.5 w-3.5" /> {meta.label}
    </span>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/70 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-600">{label}</p>
      <p className="mt-2 text-sm font-black text-zinc-200">{value}</p>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">{label}</p>
        <span className="text-zinc-500 [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Inspector({ user }: { user: { displayName: string; avatar: string | null } }) {
  const initials = user.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black px-3 py-1.5 text-xs font-black text-zinc-300">
      {user.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar} alt={user.displayName} className="h-6 w-6 rounded-full object-cover" />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px]">{initials}</span>
      )}
      {user.displayName}
    </span>
  );
}

function VehiclePlaceholder() {
  return (
    <div className="flex h-full min-h-[340px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),rgba(0,0,0,0.96)_58%)]">
      <div className="relative h-40 w-64 rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_0_80px_rgba(255,255,255,0.08)]">
        <div className="absolute left-8 right-8 top-10 h-14 rounded-t-[2rem] border border-white/15 bg-black/60" />
        <div className="absolute bottom-8 left-5 right-5 h-16 rounded-[1.5rem] border border-white/15 bg-gradient-to-b from-zinc-800 to-black" />
        <div className="absolute bottom-4 left-10 h-9 w-9 rounded-full border-4 border-zinc-600 bg-black" />
        <div className="absolute bottom-4 right-10 h-9 w-9 rounded-full border-4 border-zinc-600 bg-black" />
        <Car className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-white/20" />
      </div>
    </div>
  );
}

function DocumentItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-black/70 p-4">
      <span className="text-zinc-400 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      <div>
        <h3 className="font-black text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-zinc-500">{text}</p>
      </div>
    </div>
  );
}

function Message({ tone, text }: { tone: "ok" | "error"; text: string }) {
  return <div className={`rounded-2xl border px-5 py-4 text-sm ${tone === "ok" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-red-400/20 bg-red-400/10 text-red-200"}`}>{text}</div>;
}
