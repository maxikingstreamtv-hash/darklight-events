import Link from "next/link";
import { notFound } from "next/navigation";
import { Car } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import InspectionReportPreview from "@/components/vehicles/InspectionReportPreview";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";

type ChecklistItem = {
  id: string;
  category: string;
  label: string;
  description: string | null;
  result: string;
  required: boolean;
  sortOrder: number;
};

type Inspection = {
  id: string;
  title: string;
  notes: string | null;
  status: string;
  inspectedAt: Date | null;
  createdAt: Date;
  items: ChecklistItem[];
};

function formatDate(value: Date | null | undefined) {
  if (!value) return "Ikke registreret";

  return new Intl.DateTimeFormat("da-DK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function statusTone(status: string) {
  if (status === "APPROVED" || status === "ACTIVE") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  if (status === "REJECTED" || status === "SUSPENDED") return "border-red-400/30 bg-red-400/10 text-red-200";
  if (status === "IN_PROGRESS") return "border-blue-400/30 bg-blue-400/10 text-blue-200";
  return "border-white/10 bg-white/5 text-zinc-300";
}

function completion(items: ChecklistItem[]) {
  const relevant = items.filter((item: ChecklistItem) => item.result !== "NOT_APPLICABLE");
  if (relevant.length === 0) return 0;
  return Math.round((relevant.filter((item: ChecklistItem) => item.result === "APPROVED").length / relevant.length) * 100);
}

export default async function PlayerVehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser();
  const { id } = await params;

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id,
      ownerId: user.id,
    },
    include: {
      inspections: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          },
        },
      },
    },
  });

  if (!vehicle) {
    notFound();
  }

  return (
    <AppShell wide>
      <section className="mx-auto max-w-6xl">
        <Link
          href="/profile"
          className="inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Tilbage til Player Portal
        </Link>

        <div className="mt-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.045] shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="grid gap-0 lg:grid-cols-[420px_1fr]">
            <div className="relative aspect-square bg-neutral-950 lg:aspect-auto">
              {vehicle.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vehicle.imageUrl} alt={vehicle.displayName} className="h-full w-full object-cover" />
              ) : (
                <VehiclePlaceholder />
              )}
              <span className={`absolute left-5 top-5 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${statusTone(vehicle.status)}`}>
                {vehicle.status}
              </span>
            </div>

            <div className="p-6 lg:p-10">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">Garage / Checklist</p>
              <h1 className="mt-4 text-4xl font-black leading-none md:text-6xl">{vehicle.displayName}</h1>
              <p className="mt-4 text-sm text-zinc-500">
                {vehicle.licensePlate ?? "Ingen plade"} / {vehicle.vehicleClass ?? "Ikke angivet"} / {vehicle.eventCategory ?? "Ikke angivet"}
              </p>
              {vehicle.description ? <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">{vehicle.description}</p> : null}

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <InfoTile label="Model" value={vehicle.modelName ?? "Ikke sat"} />
                <InfoTile label="Køretøjsklasse" value={vehicle.vehicleClass ?? "Ikke angivet"} />
                <InfoTile label="Eventkategori" value={vehicle.eventCategory ?? "Ikke angivet"} />
                <InfoTile label="Opdateret" value={formatDate(vehicle.updatedAt)} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          {vehicle.inspections[0] ? (
            <InspectionReportPreview
              title={`${vehicle.inspections[0].title} / ${vehicle.displayName}`}
              subtitle="Rapportvisningen er klar til fremtidig PDF-generering."
              items={[
                { label: "Resultat", value: vehicle.inspections[0].status },
                { label: "Dato", value: formatDate(vehicle.inspections[0].inspectedAt ?? vehicle.inspections[0].createdAt) },
                { label: "Checklist", value: `${completion(vehicle.inspections[0].items)}%` },
                { label: "Køretøj", value: vehicle.status },
              ]}
            />
          ) : null}
          {vehicle.inspections.length === 0 ? (
            <Panel title="Checklist">
              <Empty text="Der er endnu ikke oprettet en checklist til dette køretøj." />
            </Panel>
          ) : (
            vehicle.inspections.map((inspection: Inspection) => (
              <Panel key={inspection.id} title={inspection.title}>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <span className={`inline-flex rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${statusTone(inspection.status)}`}>
                      {inspection.status}
                    </span>
                    <p className="mt-4 text-sm leading-6 text-zinc-400">{inspection.notes ?? "Ingen inspektionsnoter."}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/70 p-4 text-sm text-zinc-400">
                    Sidst kontrolleret: {formatDate(inspection.inspectedAt ?? inspection.createdAt)}
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {inspection.items.length === 0 ? (
                    <Empty text="Der er endnu ikke oprettet en checklist til dette køretøj." />
                  ) : (
                    inspection.items.map((item: ChecklistItem) => (
                      <article key={item.id} className="grid gap-4 rounded-2xl border border-white/10 bg-black/70 p-4 md:grid-cols-[180px_1fr_160px] md:items-center">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-600">{item.category}</p>
                          <h2 className="mt-2 text-lg font-black">{item.label}</h2>
                        </div>
                        <p className="text-sm leading-6 text-zinc-400">{item.description ?? "Ingen beskrivelse."}</p>
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <span className={`rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] ${statusTone(item.result)}`}>
                            {item.result}
                          </span>
                          {item.required ? <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-zinc-300">Krav</span> : null}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </Panel>
            ))
          )}
        </div>
      </section>
    </AppShell>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <h2 className="mb-5 text-3xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-white/10 bg-black/70 p-5 text-sm text-zinc-500">{text}</p>;
}

function VehiclePlaceholder() {
  return (
    <div className="flex h-full min-h-[320px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),rgba(0,0,0,0.96)_58%)]">
      <div className="relative h-36 w-56 rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_0_80px_rgba(255,255,255,0.08)]">
        <div className="absolute left-7 right-7 top-9 h-12 rounded-t-[2rem] border border-white/15 bg-black/60" />
        <div className="absolute bottom-8 left-5 right-5 h-14 rounded-[1.5rem] border border-white/15 bg-gradient-to-b from-zinc-800 to-black" />
        <div className="absolute bottom-4 left-9 h-8 w-8 rounded-full border-4 border-zinc-600 bg-black" />
        <div className="absolute bottom-4 right-9 h-8 w-8 rounded-full border-4 border-zinc-600 bg-black" />
        <Car className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-white/20" />
      </div>
    </div>
  );
}
