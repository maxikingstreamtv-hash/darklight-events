import AppShell from "@/components/layout/AppShell";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import SponsorDbManagerPanel from "@/components/competition/SponsorDbManagerPanel";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function SponsorAdministrationPage({ searchParams }: { searchParams: Promise<{ contentOk?: string; contentError?: string }> }) {
  const actor = await requireCurrentUser();
  if (!["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(actor.role)) redirect("/forbidden");
  const [sponsors, params] = await Promise.all([prisma.sponsor.findMany({ orderBy: [{ isMainSponsor: "desc" }, { sortOrder: "asc" }, { name: "asc" }] }), searchParams]);
  const canManage = actor.role === "SUPER_ADMIN" || actor.role === "ADMIN";
  return <AppShell wide><CompetitionLayout><main className="mx-auto max-w-7xl px-6 py-20 text-white"><p className="text-sm font-black uppercase tracking-[0.35em] text-zinc-500">EventOS</p><h1 className="mt-3 text-5xl font-black">Sponsorer</h1><p className="mt-4 max-w-3xl text-zinc-400">Global sponsoradministration. Event Managers kan se kataloget og vælge sponsorer på events; globale ændringer kræver Admin.</p>{params.contentOk ? <p className="mt-6 rounded-2xl bg-emerald-500/10 p-4 text-emerald-200">{params.contentOk}</p> : null}{params.contentError ? <p className="mt-6 rounded-2xl bg-red-500/10 p-4 text-red-200">{params.contentError}</p> : null}{canManage ? <SponsorDbManagerPanel sponsors={sponsors} canDelete={actor.role === "SUPER_ADMIN"} /> : <div className="mt-8 grid gap-4 md:grid-cols-2">{sponsors.map((sponsor) => <article key={sponsor.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"><h2 className="text-2xl font-black">{sponsor.name}</h2><p className="mt-2 text-zinc-500">{sponsor.active ? "Aktiv" : "Inaktiv"} · {sponsor.level}</p></article>)}</div>}</main></CompetitionLayout></AppShell>;
}
