import Link from "next/link";
import Footer from "@/components/layout/Footer";
import CompetitionHero from "@/components/competition/CompetitionHero";
import CompetitionCard, { type DisciplineCardData } from "@/components/competition/CompetitionCard";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type SearchParams = { discipline?: string | string[] };

export default async function CompetitionPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const currentUser = await getCurrentUser();
  const canManage = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN";
  const canCreateEvent = canManage || currentUser?.role === "EVENT_MANAGER";
  const selectedId = Array.isArray(params.discipline) ? params.discipline[0] : params.discipline;
  const disciplines = await prisma.discipline.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      events: {
        where: { active: true, public: true },
        orderBy: [{ startsAt: "asc" }],
        select: { id: true, title: true, startsAt: true, status: true },
      },
    },
  });
  const selected = disciplines.find((discipline) => discipline.id === selectedId);
  const cards: DisciplineCardData[] = disciplines.map((discipline) => ({
    id: discipline.id,
    name: discipline.name,
    description: discipline.description,
    abbreviation: discipline.abbreviation,
    category: discipline.category,
    upcomingEvents: discipline.events.filter((event) => !["COMPLETED", "CANCELLED", "ARCHIVED"].includes(event.status)).length,
    completedEvents: discipline.events.filter((event) => event.status === "COMPLETED").length,
  }));

  return (
    <main className="min-h-screen bg-black text-white">
      <CompetitionHero labels={disciplines.map((discipline) => discipline.name)} />
      <section className="bg-black px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="mb-3 text-sm uppercase tracking-[0.45em] text-zinc-500">Konkurrencer</p><h2 className="text-4xl font-black md:text-5xl">Vælg disciplin</h2></div>
            <div className="flex flex-wrap gap-3">
              <Link href="/competition/control-center" className="w-fit rounded-full bg-white px-7 py-3 font-black text-black transition hover:bg-zinc-300">Åbn Eventkontrol</Link>
              {canCreateEvent ? <Link href="/competition/events/create" className="w-fit rounded-full border border-white/15 px-7 py-3 font-black text-white transition hover:border-white/40 hover:bg-white/10">+ Opret event</Link> : null}
              {canManage ? <Link href="/competition/disciplines" className="w-fit rounded-full border border-white/15 px-7 py-3 font-black text-white transition hover:border-white/40 hover:bg-white/10">Administrér discipliner</Link> : null}
            </div>
          </div>

          {cards.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">{cards.map((discipline, index) => <CompetitionCard key={discipline.id} discipline={discipline} index={index} />)}</div>
          ) : (
            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center">
              <h2 className="text-3xl font-black">Ingen discipliner er oprettet endnu.</h2>
              <p className="mt-4 text-zinc-400">Gå til EventOS for at oprette den første disciplin.</p>
              {canManage ? <Link href="/competition/disciplines" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-black text-black">Åbn discipliner</Link> : null}
            </div>
          )}

          {selected ? (
            <section className="mt-12 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">{selected.category ?? "Disciplin"}</p>
              <h2 className="mt-3 text-4xl font-black">{selected.name}</h2>
              <p className="mt-3 max-w-3xl text-zinc-400">{selected.description}</p>
              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {selected.events.length > 0 ? selected.events.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`} className="rounded-2xl border border-white/10 bg-black p-5 transition hover:border-white/30">
                    <p className="font-black">{event.title}</p>
                    <p className="mt-2 text-sm text-zinc-500">{event.startsAt.toLocaleString("da-DK")} · {event.status}</p>
                  </Link>
                )) : <p className="text-zinc-500">Ingen events endnu.</p>}
              </div>
            </section>
          ) : null}
        </div>
      </section>
      <Footer />
    </main>
  );
}
