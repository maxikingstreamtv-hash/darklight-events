/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { formatResultTime } from "@/lib/events/result-time";
import { formatPrizeCurrency } from "@/lib/events/prize-currency";
import { hasCompletePodium, podiumResults } from "@/lib/results/podium";

export const dynamic = "force-dynamic";

export default async function HallOfFamePage({ searchParams }: { searchParams: Promise<{ eventId?: string; disciplineId?: string; year?: string }> }) {
  const filters = await searchParams;
  const year = Number(filters.year);
  const events = await prisma.event.findMany({
    where: { public: true, active: true, ...(filters.eventId ? { id: filters.eventId } : {}), ...(filters.disciplineId ? { disciplineId: filters.disciplineId } : {}), ...(Number.isInteger(year) ? { startsAt: { gte: new Date(`${year}-01-01T00:00:00Z`), lt: new Date(`${year + 1}-01-01T00:00:00Z`) } } : {}) },
    orderBy: { startsAt: "desc" },
    include: {
      discipline: { select: { id: true, name: true } },
      competitions: { include: { results: { where: { placement: { in: [1, 2, 3] }, status: "APPROVED" }, include: { participant: true } } } },
      prizes: { where: { active: true }, orderBy: [{ placement: "asc" }, { sortOrder: "asc" }], include: { winners: true } },
    },
  });
  const selected = events.find((event) => hasCompletePodium(event.competitions.flatMap((competition) => competition.results))) ?? null;
  const allResults = selected?.competitions.flatMap((competition) => competition.results.map((result) => ({ ...result, competitionTitle: competition.title }))) ?? [];
  const podium = podiumResults(allResults);
  const userIds = podium.flatMap((result) => result?.participant.userId ? [result.participant.userId] : []);
  const users = userIds.length ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, avatar: true } }) : [];
  const avatars = new Map(users.map((user) => [user.id, user.avatar]));
  const [eventOptions, disciplines] = await Promise.all([
    prisma.event.findMany({ where: { public: true, active: true }, orderBy: { startsAt: "desc" }, select: { id: true, title: true } }),
    prisma.discipline.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  return <main className="min-h-screen bg-black text-white"><section className="px-6 py-28"><div className="mx-auto max-w-7xl">
    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="text-sm uppercase tracking-[0.4em] text-zinc-500">Resultater fra EventOS</p><h1 className="mt-4 text-5xl font-black md:text-7xl">Hall of Fame</h1><p className="mt-5 max-w-3xl text-zinc-400">Podiet opdateres automatisk fra officielle resultater og præmietildelinger.</p></div><Link href="/rangliste" className="w-fit rounded-full border border-white/15 px-6 py-3 font-black">Se rangliste</Link></div>
    <form className="mt-8 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:grid-cols-3"><select name="eventId" defaultValue={filters.eventId ?? ""} className="rounded-2xl border border-white/10 bg-black px-4 py-3"><option value="">Seneste fulde podium</option>{eventOptions.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select><select name="disciplineId" defaultValue={filters.disciplineId ?? ""} className="rounded-2xl border border-white/10 bg-black px-4 py-3"><option value="">Alle discipliner</option>{disciplines.map((discipline) => <option key={discipline.id} value={discipline.id}>{discipline.name}</option>)}</select><div className="flex gap-3"><input name="year" type="number" defaultValue={filters.year ?? ""} placeholder="År" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black px-4 py-3" /><button className="rounded-2xl bg-white px-5 font-black text-black">Filtrér</button></div></form>
    {selected ? <><div className="mt-14 grid items-end gap-5 md:grid-cols-3">{[podium[1], podium[0], podium[2]].map((result) => {
      if (!result) return null;
      const prizes = selected.prizes.filter((prize) => prize.placement === result.placement || prize.winners.some((winner) => winner.participantId === result.participantId || (winner.userId && winner.userId === result.participant.userId)));
      const style = result.placement === 1 ? "border-amber-300/50 bg-amber-300/[0.08] md:min-h-[34rem]" : result.placement === 2 ? "border-zinc-300/40 bg-zinc-300/[0.06] md:min-h-[29rem]" : "border-orange-700/50 bg-orange-700/[0.08] md:min-h-[26rem]";
      const avatar = result.participant.userId ? avatars.get(result.participant.userId) : null;
      return <article key={result.id} className={`flex flex-col justify-end rounded-[2.5rem] border p-7 text-center ${style}`}><div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-white/20 bg-zinc-900">{avatar ? <img src={avatar} alt={result.participant.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl font-black">{result.participant.name.slice(0, 2).toUpperCase()}</div>}</div><p className="mt-5 text-6xl font-black">{result.placement}.</p><h2 className="mt-3 text-3xl font-black">{result.participant.name}</h2><p className="mt-2 text-sm text-zinc-400">{result.competitionTitle}</p><div className="mt-5 flex flex-wrap justify-center gap-2">{result.finishTimeMs != null ? <span className="rounded-full bg-black/60 px-4 py-2 font-black">Tid {formatResultTime(result.finishTimeMs)}</span> : null}{result.points != null ? <span className="rounded-full bg-black/60 px-4 py-2 font-black">{result.points} point</span> : null}</div>{result.participant.vehicle ? <p className="mt-4 text-sm text-zinc-400">{result.participant.vehicle}</p> : null}{prizes.length ? <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Præmier</p>{prizes.map((prize) => <p key={prize.id} className="mt-2 text-sm font-bold">{prize.amount ? formatPrizeCurrency(Number(prize.amount), prize.currency) : prize.itemName ?? prize.awardLabel ?? prize.title}</p>)}</div> : null}</article>;
    })}</div><p className="mt-8 text-center text-zinc-500">{selected.title} · {selected.discipline?.name ?? "Ingen disciplin"} · {selected.startsAt.toLocaleDateString("da-DK")}</p></> : <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center"><h2 className="text-3xl font-black">Intet fuldt podium endnu</h2><p className="mt-4 text-zinc-500">Siden udfyldes, når et event har godkendte resultater for 1., 2. og 3. plads.</p></div>}
  </div></section><Footer /></main>;
}
