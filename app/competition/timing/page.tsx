import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { TimingClock, TimingConnection, TimingSubmitButton } from "@/components/timing/TimingClient";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { canManageTiming, formatTimingMs, provisionalPlacements, timingStatusLabel, timingSummary } from "@/lib/timing/timing";
import {
  cancelTimingSessionAction,
  addParticipantToTimingSessionAction,
  correctTimingEntryAction,
  createTimingSessionAction,
  finishTimingSessionAction,
  reopenTimingEntryAction,
  reopenTimingSessionAction,
  setTimingEntryStatusAction,
  startTimingSessionAction,
  stopTimingEntryAction,
  transferTimingResultsAction,
} from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const field = "w-full min-w-0 rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/35";
const button = "inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-4 py-2 text-sm font-black transition hover:bg-white hover:text-black";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function eventStatusLabel(status: string) {
  return ({ DRAFT: "Kladde", PUBLISHED: "Kommende", REGISTRATION_OPEN: "Tilmelding åben", REGISTRATION_CLOSED: "Tilmelding lukket", IN_PROGRESS: "I gang", COMPLETED: "Afsluttet" } as Record<string, string>)[status] ?? status;
}

export default async function TimingPage({ searchParams }: PageProps) {
  const user = await requireCurrentUser();
  if (!canManageTiming(user.role)) redirect("/forbidden");
  const query = await searchParams;
  const selectedEventId = one(query.eventId);
  const filter = one(query.filter) ?? "all";
  const search = (one(query.search) ?? "").trim().toLocaleLowerCase("da-DK");
  const serverNow = new Date();

  const events = await prisma.event.findMany({
    where: {
      active: true,
      usesResults: true,
      status: { notIn: ["CANCELLED", "ARCHIVED"] },
      OR: [
        { registrations: { some: { status: { in: ["APPROVED", "CHECKED_IN"] } } } },
        { competitions: { some: { participants: { some: { status: { in: ["APPROVED", "CHECKED_IN"] } } } } } },
      ],
    },
    orderBy: [{ startsAt: "desc" }, { title: "asc" }],
    select: {
      id: true, title: true, startsAt: true, location: true, status: true,
      _count: { select: { registrations: { where: { status: { in: ["APPROVED", "CHECKED_IN"] } } } } },
      competitions: { select: { participants: { where: { status: { in: ["APPROVED", "CHECKED_IN"] } }, select: { id: true } } } },
      timingSessions: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, resultsTransferredAt: true } },
    },
  });

  const selectedEvent = selectedEventId ? events.find((event) => event.id === selectedEventId) : undefined;
  const activeSession = selectedEvent ? await prisma.timingSession.findFirst({
    where: { eventId: selectedEvent.id, activeKey: { not: null } },
    orderBy: { createdAt: "desc" },
    include: {
      entries: { include: { participant: true }, orderBy: [{ participant: { number: "asc" } }, { participant: { name: "asc" } }] },
      competition: { select: { title: true } },
    },
  }) : null;
  const session = activeSession ?? (selectedEvent ? await prisma.timingSession.findFirst({
    where: { eventId: selectedEvent.id },
    orderBy: { createdAt: "desc" },
    include: {
      entries: { include: { participant: true }, orderBy: [{ participant: { number: "asc" } }, { participant: { name: "asc" } }] },
      competition: { select: { title: true } },
    },
  }) : null);

  const participantUserIds = session?.entries.flatMap((entry) => entry.participant.userId ? [entry.participant.userId] : []) ?? [];
  const avatars = participantUserIds.length ? new Map((await prisma.user.findMany({ where: { id: { in: participantUserIds } }, select: { id: true, avatar: true } })).map((item) => [item.id, item.avatar])) : new Map<string, string | null>();
  const ranks = provisionalPlacements(session?.entries ?? []);
  const summary = timingSummary(session?.entries ?? []);
  const entries = (session?.entries ?? []).filter((entry) => {
    const matchesSearch = !search || `${entry.participant.number ?? ""} ${entry.participant.name}`.toLocaleLowerCase("da-DK").includes(search);
    const matchesFilter = filter === "all"
      || (filter === "running" && entry.status === "RUNNING")
      || (filter === "finished" && entry.status === "FINISHED")
      || (filter === "exceptions" && ["DNF", "DNS", "DISQUALIFIED"].includes(entry.status))
      || (filter === "missing" && entry.status === "READY");
    return matchesSearch && matchesFilter;
  });
  const terminal = Boolean(session?.entries.length && session.entries.every((entry) => ["FINISHED", "DNF", "DNS", "DISQUALIFIED"].includes(entry.status)));
  const closed = session?.status === "FINISHED" || session?.status === "CANCELLED";
  const mutationLocked = closed || Boolean(session?.resultsTransferredAt);
  const existingResultCount = session ? await prisma.result.count({ where: { competitionId: session.competitionId, participantId: { in: session.entries.map((entry) => entry.participantId) } } }) : 0;
  const availableParticipants = session && !mutationLocked ? await prisma.participant.findMany({ where: { competitionId: session.competitionId, status: { in: ["APPROVED", "CHECKED_IN"] }, id: { notIn: session.entries.map((entry) => entry.participantId) } }, orderBy: [{ number: "asc" }, { name: "asc" }], select: { id: true, name: true, number: true } }) : [];

  return (
    <CompetitionLayout>
      <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">EventOS · Drift</p>
              <h1 className="mt-3 text-4xl font-black sm:text-6xl">Tidstagning</h1>
              <p className="mt-4 max-w-3xl text-zinc-400">Serverens modtagelsestid er autoritativ. Klienturet er kun en løbende visning.</p>
            </div>
            <TimingConnection active={session?.status === "RUNNING"} />
          </div>

          {(one(query.ok) || one(query.error)) && <div className={`mt-8 rounded-2xl border p-4 ${one(query.error) ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"}`}>{one(query.error) ?? one(query.ok)}</div>}

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <form method="get" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <label className="min-w-0 text-sm font-bold text-zinc-300">Vælg event
                <select name="eventId" defaultValue={selectedEventId ?? ""} className={`${field} mt-2`}>
                  <option value="">Vælg et event…</option>
                  {events.map((event) => <option key={event.id} value={event.id}>{event.title} · {event.startsAt.toLocaleDateString("da-DK")} · {event.location ?? "Ingen lokation"} · {eventStatusLabel(event.status)} · {Math.max(event._count.registrations, new Set(event.competitions.flatMap((competition) => competition.participants.map((participant) => participant.id))).size)} deltagere · {event.timingSessions[0] ? timingStatusLabel(event.timingSessions[0].status) : "Ikke oprettet"}</option>)}
                </select>
              </label>
              <button className={`${button} bg-white text-black`}>Åbn tidtagning</button>
            </form>
            {events.length === 0 && <p className="mt-4 text-sm text-zinc-500">Ingen events med resultatmodul og godkendte deltagere er klar til tidstagning.</p>}
          </section>

          {selectedEvent && !session && <section id="timing-panel" className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
            <h2 className="text-3xl font-black">{selectedEvent.title}</h2>
            <p className="mt-3 text-zinc-400">Opret en session med et fast snapshot af de nuværende godkendte deltagere.</p>
            <form action={createTimingSessionAction.bind(null, selectedEvent.id)} className="mt-6"><TimingSubmitButton className={`${button} bg-white text-black`}>Opret tidtagningssession</TimingSubmitButton></form>
          </section>}

          {selectedEvent && session && <div id="timing-panel" className="mt-8 space-y-6">
            <section className="sticky top-3 z-20 rounded-[2rem] border border-white/10 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur sm:p-7">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div className="min-w-0"><p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{timingStatusLabel(session.status)} · {session.competition.title}</p><h2 className="mt-2 truncate text-2xl font-black sm:text-4xl">{selectedEvent.title}</h2></div>
                <TimingClock startedAt={session.startedAt?.toISOString() ?? null} running={session.status === "RUNNING"} serverNow={serverNow.toISOString()} className="text-4xl font-black sm:text-6xl" />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {session.status === "READY" && <form action={startTimingSessionAction.bind(null, session.id)} className="flex flex-wrap items-center gap-3"><label className="text-sm text-zinc-300"><input required type="checkbox" name="confirmStart" className="mr-2" />Start tiden for alle {session.entries.length} deltagere?</label><TimingSubmitButton disabled={!session.entries.length} className="min-h-14 rounded-xl bg-emerald-400 px-8 text-lg font-black text-black">Start alle</TimingSubmitButton></form>}
                {session.status === "FINISHED" && <form action={reopenTimingSessionAction.bind(null, session.id)} className="flex items-center gap-3"><label className="text-sm"><input required type="checkbox" name="confirmReopen" className="mr-2" />Bekræft genåbning</label><TimingSubmitButton className={button}>Genåbn session</TimingSubmitButton></form>}
                {closed && <form action={createTimingSessionAction.bind(null, selectedEvent.id)}><TimingSubmitButton className={button}>Opret ny session</TimingSubmitButton></form>}
                <Link href={`/competition/events/${selectedEvent.id}?tab=results`} className={button}>Event Command Center</Link>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-6">
              {[["Deltagere", summary.total], ["Kører", summary.running], ["Færdige", summary.finished], ["DNF", summary.dnf], ["DNS", summary.dns], ["Mangler", summary.missing]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>)}
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 sm:p-6">
              <form method="get" className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                <input type="hidden" name="eventId" value={selectedEvent.id} /><input name="search" defaultValue={one(query.search)} placeholder="Søg navn eller startnummer" className={field} />
                <select name="filter" defaultValue={filter} className={field}><option value="all">Alle</option><option value="running">Kører</option><option value="finished">Færdige</option><option value="exceptions">DNF / DNS / diskvalificeret</option><option value="missing">Mangler</option></select>
                <button className={button}>Filtrér</button>
              </form>
              {availableParticipants.length > 0 && <form action={addParticipantToTimingSessionAction.bind(null, session.id)} className="mt-4 grid gap-3 border-t border-white/10 pt-4 md:grid-cols-[minmax(0,1fr)_auto]"><select required name="participantId" className={field}><option value="">Tilføj godkendt deltager eksplicit…</option>{availableParticipants.map((participant) => <option key={participant.id} value={participant.id}>#{participant.number ?? "—"} · {participant.name}</option>)}</select><TimingSubmitButton className={button}>Tilføj til session</TimingSubmitButton></form>}
            </section>

            <section className="space-y-4">
              {entries.map((entry) => {
                const participant = entry.participant;
                const avatar = participant.userId ? avatars.get(participant.userId) : null;
                return <article key={entry.id} className={`rounded-[1.75rem] border p-5 ${entry.status === "FINISHED" ? "border-emerald-500/25 bg-emerald-500/[0.06]" : entry.status === "RUNNING" ? "border-amber-400/30 bg-amber-400/[0.06]" : ["DNF", "DNS", "DISQUALIFIED"].includes(entry.status) ? "border-red-500/20 bg-red-500/[0.05]" : "border-white/10 bg-white/[0.04]"}`}>
                  <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-800 font-black">{avatar ? <Image src={avatar} alt="" width={56} height={56} className="h-full w-full object-cover" /> : participant.name.slice(0, 2).toUpperCase()}</div>
                      <div className="min-w-0"><p className="text-xs uppercase tracking-wider text-zinc-500">#{participant.number ?? "—"} · {timingStatusLabel(entry.status)}{entry.manuallyAdjusted ? " · Manuelt rettet" : ""}</p><h3 className="truncate text-xl font-black">{participant.name}</h3><p className="mt-1 text-sm text-zinc-400">Foreløbig placering: {ranks.get(entry.id) ? `${ranks.get(entry.id)}.` : "—"}</p></div>
                    </div>
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                      <TimingClock startedAt={entry.startedAt?.toISOString() ?? session.startedAt?.toISOString() ?? null} elapsedMs={entry.elapsedMs} running={entry.status === "RUNNING"} serverNow={serverNow.toISOString()} className="text-3xl font-black" />
                      {entry.status === "RUNNING" && !mutationLocked && <form action={stopTimingEntryAction.bind(null, entry.id)}><TimingSubmitButton className="min-h-16 w-full rounded-xl bg-white px-7 text-lg font-black text-black sm:w-auto">Stop tid</TimingSubmitButton></form>}
                    </div>
                  </div>

                  {!mutationLocked && <div className="mt-5 grid min-w-0 gap-4 border-t border-white/10 pt-5 lg:grid-cols-2">
                    {(entry.status === "READY" || entry.status === "RUNNING" || entry.status === "FINISHED") && <div className="flex min-w-0 flex-wrap gap-2">
                      {entry.status === "RUNNING" && <form action={setTimingEntryStatusAction.bind(null, entry.id, "DNF")}><TimingSubmitButton className={button}>DNF</TimingSubmitButton></form>}
                      {(entry.status === "READY" || entry.status === "RUNNING") && <form action={setTimingEntryStatusAction.bind(null, entry.id, "DNS")}><TimingSubmitButton className={button}>DNS</TimingSubmitButton></form>}
                      <form action={setTimingEntryStatusAction.bind(null, entry.id, "DISQUALIFIED")} className="flex min-w-0 flex-1 flex-wrap gap-2"><input name="note" placeholder="Begrundelse" className={`${field} min-w-40 flex-1`} /><label className="self-center text-xs"><input required type="checkbox" name="confirmDisqualified" className="mr-1" />Bekræft</label><TimingSubmitButton className={`${button} border-red-500/30 text-red-300`}>Diskvalificér</TimingSubmitButton></form>
                    </div>}
                    {entry.status === "FINISHED" && <form action={correctTimingEntryAction.bind(null, entry.id)} className="grid min-w-0 gap-2 sm:grid-cols-[160px_minmax(0,1fr)_auto]"><input name="elapsed" defaultValue={entry.elapsedMs == null ? "" : formatTimingMs(entry.elapsedMs)} aria-label="Rettet tid" className={field} /><input required name="note" defaultValue={entry.note ?? ""} placeholder="Begrundelse for rettelse" className={field} /><TimingSubmitButton className={button}>Ret tid</TimingSubmitButton></form>}
                    {["FINISHED", "DNF", "DNS", "DISQUALIFIED"].includes(entry.status) && <form action={reopenTimingEntryAction.bind(null, entry.id)} className="flex flex-wrap items-center justify-end gap-2"><label className="text-xs"><input required type="checkbox" name="confirmReopen" className="mr-1" />Bekræft</label><TimingSubmitButton className={button}>Fortryd stop/status</TimingSubmitButton></form>}
                  </div>}
                </article>;
              })}
              {entries.length === 0 && <div className="rounded-2xl border border-white/10 p-8 text-center text-zinc-500">Ingen deltagere matcher filteret.</div>}
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h3 className="text-2xl font-black">Overfør til resultater</h3><p className="mt-3 text-sm text-zinc-400">Laveste færdige tid får placering 1. DNF, DNS og diskvalificerede får ingen normal placering. Overførslen er transaktionel.</p>{existingResultCount > 0 && <p className="mt-3 text-sm font-bold text-amber-300">Advarsel: {existingResultCount} eksisterende resultater berøres og kræver bekræftet overskrivning.</p>}<form action={transferTimingResultsAction.bind(null, session.id)} className="mt-5 flex flex-wrap items-center gap-3">{existingResultCount > 0 && <label className="text-sm"><input required type="checkbox" name="confirmOverwrite" className="mr-2" />Overskriv eksisterende resultater</label>}<TimingSubmitButton disabled={!terminal || Boolean(session.resultsTransferredAt) || closed} className={`${button} bg-white text-black`}>{session.resultsTransferredAt ? "Overført" : "Overfør til resultater"}</TimingSubmitButton></form></div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"><h3 className="text-2xl font-black">Session</h3><div className="mt-5 space-y-5">{session.resultsTransferredAt && session.status !== "FINISHED" && <form action={finishTimingSessionAction.bind(null, session.id)}><TimingSubmitButton className={`${button} bg-emerald-400 text-black`}>Afslut tidstagning</TimingSubmitButton></form>}{!closed && !session.resultsTransferredAt && <form action={cancelTimingSessionAction.bind(null, session.id)} className="grid min-w-0 gap-3"><input required name="reason" placeholder="Begrundelse for annullering" className={field} /><label className="text-sm"><input required type="checkbox" name="confirmCancel" className="mr-2" />Jeg vil annullere sessionen</label><TimingSubmitButton className={`${button} border-red-500/30 text-red-300`}>Annullér tidstagning</TimingSubmitButton></form>}</div></div>
            </section>
            <p className="text-center text-xs leading-5 text-zinc-600">Serverens modtagelsestid bestemmer start og stop. Netværksforsinkelse kan påvirke få millisekunder; løsningen er ikke professionelt chip-timing-udstyr.</p>
          </div>}
        </div>
      </main>
    </CompetitionLayout>
  );
}
