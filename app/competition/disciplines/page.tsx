import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import EventFeatureFields from "@/components/events/EventFeatureFields";
import { createDisciplineAction, deleteDisciplineAction, updateDisciplineAction } from "./actions";
import { requireCurrentUser } from "@/lib/auth/session";
import { NEW_EVENT_FEATURE_DEFAULTS } from "@/lib/events/event-features";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DisciplinesAdminPage() {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") redirect("/forbidden");
  const disciplines = await prisma.discipline.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { events: true } } } });

  return (
    <CompetitionLayout>
      <main className="bg-black px-6 py-28 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">EventOS</p>
              <h1 className="mt-4 text-5xl font-black md:text-7xl">Discipliner</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">Databasedrevne presets til eventfunktioner. Det enkelte event kan altid tilpasses efterfølgende.</p>
            </div>
            <Link href="/competition/events" className="w-fit rounded-full border border-white/15 px-6 py-3 font-black">Til EventOS</Link>
          </div>

          <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-black">Opret disciplin</h2>
            <DisciplineForm action={createDisciplineAction} initial={NEW_EVENT_FEATURE_DEFAULTS} />
          </section>

          <section className="mt-8 grid gap-5">
            {disciplines.length === 0 ? (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
                <h2 className="text-3xl font-black">Ingen discipliner er oprettet endnu.</h2>
                <p className="mt-3 text-zinc-400">Opret den første disciplin ovenfor.</p>
              </div>
            ) : disciplines.map((discipline) => (
              <article key={discipline.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div><h2 className="text-2xl font-black">{discipline.name}</h2><p className="mt-1 text-sm text-zinc-500">{discipline._count.events} events · {discipline.active ? "Aktiv" : "Inaktiv"}</p></div>
                  <form action={deleteDisciplineAction.bind(null, discipline.id)}>
                    <button disabled={discipline._count.events > 0} className="rounded-full border border-red-400/30 px-4 py-2 text-sm font-black text-red-200 disabled:opacity-40">Slet</button>
                  </form>
                </div>
                <DisciplineForm action={updateDisciplineAction.bind(null, discipline.id)} initial={discipline} discipline={discipline} />
              </article>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </CompetitionLayout>
  );
}

function DisciplineForm({ action, initial, discipline }: { action: (formData: FormData) => void | Promise<void>; initial: typeof NEW_EVENT_FEATURE_DEFAULTS; discipline?: { name: string; description: string; abbreviation: string; category: string | null; active: boolean; sortOrder: number } }) {
  return (
    <form action={action} className="mt-5 grid min-w-0 gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Navn"><input name="name" required defaultValue={discipline?.name} className={inputClass} /></Field>
        <Field label="Forkortelse"><input name="abbreviation" required maxLength={6} defaultValue={discipline?.abbreviation} className={inputClass} /></Field>
        <Field label="Kategori"><input name="category" defaultValue={discipline?.category ?? ""} className={inputClass} /></Field>
        <Field label="Sortering"><input name="sortOrder" type="number" defaultValue={discipline?.sortOrder ?? 0} className={inputClass} /></Field>
      </div>
      <Field label="Beskrivelse"><textarea name="description" required defaultValue={discipline?.description} className={`${inputClass} min-h-24`} /></Field>
      <EventFeatureFields initial={initial} />
      <label className="flex items-center gap-3"><input name="active" type="checkbox" defaultChecked={discipline?.active ?? true} /> Aktiv</label>
      <button className="w-fit rounded-full bg-white px-6 py-3 font-black text-black">{discipline ? "Gem disciplin" : "Opret disciplin"}</button>
    </form>
  );
}

const inputClass = "w-full min-w-0 rounded-2xl border border-white/10 bg-black px-4 py-3 text-white";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid min-w-0 gap-2"><span className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">{label}</span>{children}</label>;
}
