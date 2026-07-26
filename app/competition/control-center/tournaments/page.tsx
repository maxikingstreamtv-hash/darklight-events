import Link from "next/link";
import ControlCenterLayout from "@/components/competition/ControlCenterLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ControlCenterTournamentsPage() {
  const disciplines = await prisma.discipline.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return (
    <ControlCenterLayout>
      <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">Eventkontrol</p>
          <h1 className="text-4xl font-black md:text-6xl">Discipliner</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">Aktive discipliner oprettet og administreret gennem EventOS.</p>
          {disciplines.length > 0 ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {disciplines.map((discipline) => (
                <Link key={discipline.id} href={`/competition?discipline=${discipline.id}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-white/30">
                  <div className="mb-5 flex items-center justify-between gap-4"><span className="text-2xl font-black">{discipline.abbreviation}</span><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">Aktiv</span></div>
                  <h2 className="text-2xl font-black">{discipline.name}</h2>
                  <p className="mt-4 text-sm leading-7 text-zinc-400">{discipline.description}</p>
                </Link>
              ))}
            </div>
          ) : <p className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-zinc-400">Ingen discipliner er oprettet endnu.</p>}
        </div>
      </section>
    </ControlCenterLayout>
  );
}
