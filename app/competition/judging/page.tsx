import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { saveJudgeScoreAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function JudgingPage({ searchParams }: { searchParams: Promise<{ eventId?: string; saved?: string }> }) {
  const user = await requireCurrentUser();
  if (user.role !== "JUDGE") return <CompetitionLayout><section className="px-6 py-28 text-white"><p>Kun dommere har adgang til dommerpanelet.</p></section></CompetitionLayout>;
  const query = await searchParams;
  const assignments = await prisma.eventJudge.findMany({ where: { userId: user.id, active: true }, orderBy: { event: { startsAt: "desc" } }, select: { event: { select: { id: true, title: true, resultMethod: true, judgePointsMin: true, judgePointsMax: true, judgingLockedAt: true, resultsPublishedAt: true } } } });
  const selected = assignments.find((assignment) => assignment.event.id === query.eventId) ?? assignments[0];
  const participants = selected ? await prisma.participant.findMany({ where: { competition: { eventId: selected.event.id }, status: { in: ["APPROVED", "CHECKED_IN"] } }, orderBy: [{ competitionId: "asc" }, { number: "asc" }, { name: "asc" }], include: { competition: { select: { title: true } }, judgeScores: { where: { judgeId: user.id }, select: { points: true, note: true, status: true } } } }) : [];
  return <CompetitionLayout><section className="bg-black px-6 py-28 text-white"><div className="mx-auto max-w-6xl">
    <p className="text-sm uppercase tracking-[.4em] text-zinc-500">EventOS · Dommer</p><h1 className="mt-3 text-5xl font-black">Dommerbedømmelse</h1>
    <div className="mt-8 flex flex-wrap gap-2">{assignments.map(({ event }) => <Link key={event.id} href={`/competition/judging?eventId=${event.id}`} className="rounded-full border border-white/15 px-4 py-2 font-bold">{event.title}</Link>)}</div>
    {query.saved ? <p className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">Bedømmelsen blev gemt.</p> : null}
    {!selected ? <p className="mt-10 text-zinc-400">Du er ikke tildelt et aktivt event.</p> : <><div className="mt-8 rounded-2xl border border-white/10 p-5"><h2 className="text-2xl font-black">{selected.event.title}</h2><p className="mt-2 text-sm text-zinc-400">Point: {selected.event.judgePointsMin}–{selected.event.judgePointsMax}. Du ser kun dine egne scores.</p></div>
      <div className="mt-6 grid gap-4">{participants.map((participant) => { const score=participant.judgeScores[0]; const locked=Boolean(selected.event.judgingLockedAt || selected.event.resultsPublishedAt); return <form key={participant.id} action={saveJudgeScoreAction.bind(null, selected.event.id, participant.id)} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[.04] p-5 md:grid-cols-[1fr_130px_2fr_auto] md:items-end"><div><p className="text-xs uppercase text-zinc-500">{participant.competition.title} · {participant.number ?? "Uden nr."}</p><h3 className="text-xl font-black">{participant.name}</h3><p className="text-sm text-zinc-400">{participant.vehicle ?? "Intet køretøj"}</p></div><label className="grid gap-1 text-xs text-zinc-400">Point<input disabled={locked} required name="points" type="number" min={selected.event.judgePointsMin} max={selected.event.judgePointsMax} defaultValue={score?.points} className="rounded-xl border border-white/10 bg-black px-3 py-2 text-white" /></label><label className="grid gap-1 text-xs text-zinc-400">Dommernote<input disabled={locked} name="note" defaultValue={score?.note ?? ""} className="rounded-xl border border-white/10 bg-black px-3 py-2 text-white" /></label><div className="flex gap-2"><button disabled={locked} name="intent" value="draft" className="rounded-full border border-white/15 px-4 py-2 font-bold">Gem kladde</button><button disabled={locked} name="intent" value="submit" className="rounded-full bg-white px-4 py-2 font-black text-black">Afgiv</button></div><p className="text-xs text-zinc-500 md:col-span-4">Status: {score?.status === "SUBMITTED" ? "Afgivet" : score ? "Kladde" : "Ikke bedømt"}</p></form> })}</div></>}
  </div></section></CompetitionLayout>;
}
