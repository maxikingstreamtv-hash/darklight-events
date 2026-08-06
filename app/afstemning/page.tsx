import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function VotingOverviewPage() {
  const now = new Date();
  const events = await prisma.event.findMany({ where: { active: true, public: true, resultMethod: { in: ["PUBLIC_VOTE_ONLY", "JUDGE_AND_PUBLIC_VOTE"] }, votingOpenAt: { lte: now }, OR: [{ votingCloseAt: null }, { votingCloseAt: { gt: now } }], resultsPublishedAt: null }, orderBy: { startsAt: "asc" }, select: { id: true, title: true, description: true, votingCloseAt: true } });
  return <main className="min-h-screen bg-black px-6 py-28 text-white"><div className="mx-auto max-w-6xl"><h1 className="text-5xl font-black">Aktive afstemninger</h1><div className="mt-8 grid gap-5 md:grid-cols-2">{events.map(event=><article key={event.id} className="rounded-[2rem] border border-white/10 p-6"><h2 className="text-2xl font-black">{event.title}</h2><p className="mt-3 text-zinc-400">{event.description}</p><Link href={`/events/${event.id}/vote`} className="mt-5 inline-flex rounded-full bg-white px-5 py-2 font-black text-black">Stem nu</Link></article>)}{events.length===0?<p className="text-zinc-400">Der er ingen åbne afstemninger lige nu.</p>:null}</div></div></main>;
}
