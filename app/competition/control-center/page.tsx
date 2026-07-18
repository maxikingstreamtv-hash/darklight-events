import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import CompetitionPageShell from "@/components/competition/layout/CompetitionPageShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ControlCenterPage() {
  const [
    events,
    participants,
    results,
    sponsors,
    bookings,
    registrationsPending,
    vehicleInspectionsPending,
    activeCompetitions,
    hallOfFameEntries,
    tasks,
    pendingRegistrations,
    pendingInspections,
    setupEvents,
    competitionsWithoutHeats,
    competitionsWithoutBrackets,
    unfinishedResults,
    competitionsAwaitingResults,
    recentActivity,
  ] = await Promise.all([
    prisma.event.findMany({
      orderBy: [{ startsAt: "desc" }],
      include: {
        competitions: {
          select: {
            id: true,
            title: true,
            type: true,
            heats: { select: { id: true, status: true } },
            brackets: { select: { id: true, status: true } },
            _count: {
              select: {
                participants: true,
                results: true,
              },
            },
          },
        },
      },
    }),
    prisma.participant.count(),
    prisma.result.count(),
    prisma.sponsor.count({ where: { active: true, status: "ACTIVE" } }),
    prisma.bookingRequest.count(),
    prisma.eventRegistration.count({ where: { status: "PENDING" } }),
    prisma.vehicleInspection.count({ where: { status: { in: ["PENDING", "IN_PROGRESS"] } } }),
    prisma.competition.count({ where: { event: { status: "ACTIVE", active: true } } }),
    prisma.hallOfFame.count({ where: { active: true } }),
    prisma.eventTask.findMany({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 6,
      include: { event: { select: { title: true } } },
    }),
    prisma.eventRegistration.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 3,
      include: {
        event: { select: { id: true, title: true } },
        user: { select: { displayName: true } },
      },
    }),
    prisma.vehicleInspection.findMany({
      where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
      orderBy: { createdAt: "asc" },
      take: 3,
      include: {
        vehicle: {
          select: {
            id: true,
            displayName: true,
            owner: { select: { displayName: true } },
          },
        },
      },
    }),
    prisma.event.findMany({
      where: {
        active: true,
        OR: [
          { public: false },
          { status: "DRAFT" },
          { competitions: { none: {} } },
        ],
      },
      orderBy: [{ startsAt: "asc" }],
      take: 3,
      select: { id: true, title: true, status: true, public: true },
    }),
    prisma.competition.findMany({
      where: { heats: { none: {} } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { event: { select: { id: true, title: true } } },
    }),
    prisma.competition.findMany({
      where: { brackets: { none: {} }, participants: { some: {} } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { event: { select: { id: true, title: true } } },
    }),
    prisma.result.findMany({
      where: { status: { in: ["PENDING", "REJECTED"] } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { competition: { include: { event: { select: { id: true, title: true } } } }, participant: { select: { name: true } } },
    }),
    prisma.competition.findMany({
      where: {
        participants: { some: {} },
        results: { none: {} },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { event: { select: { id: true, title: true } } },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { displayName: true } } },
    }),
  ]);
  const activeEvent = events.find((event) => event.status === "ACTIVE") ?? events[0];
  const actionCards = [
    {
      title: "Tilmeldinger der afventer",
      value: registrationsPending,
      text: pendingRegistrations[0]
        ? `${pendingRegistrations[0].user.displayName} til ${pendingRegistrations[0].event.title}`
        : "Ingen ventende tilmeldinger.",
      href: pendingRegistrations[0] ? `/competition/events/${pendingRegistrations[0].event.id}?tab=participants#deltagere` : "/competition/events",
      action: "Godkend nu",
      tone: "primary",
    },
    {
      title: "Køretøjer der afventer syn",
      value: vehicleInspectionsPending,
      text: pendingInspections[0]
        ? `${pendingInspections[0].vehicle.displayName} · ${pendingInspections[0].vehicle.owner.displayName}`
        : "Ingen køretøjer venter på syn.",
      href: pendingInspections[0] ? `/admin/vehicles/${pendingInspections[0].vehicle.id}` : "/admin/vehicles",
      action: "Åbn syn",
      tone: "secondary",
    },
    {
      title: "Events der mangler opsætning",
      value: setupEvents.length,
      text: setupEvents[0] ? `${setupEvents[0].title} · ${setupEvents[0].status}` : "Alle aktive events har basisopsætning.",
      href: setupEvents[0] ? `/competition/events/${setupEvents[0].id}?tab=settings#indstillinger` : "/competition/events",
      action: "Åbn event",
      tone: "secondary",
    },
    {
      title: "Konkurrencer uden køreliste",
      value: competitionsWithoutHeats.length,
      text: competitionsWithoutHeats[0] ? `${competitionsWithoutHeats[0].title} · ${competitionsWithoutHeats[0].event.title}` : "Ingen manglende kørelister.",
      href: competitionsWithoutHeats[0] ? `/competition/events/${competitionsWithoutHeats[0].event.id}?tab=heats#køreliste` : "/competition/heat-manager",
      action: "Lav køreliste",
      tone: "primary",
    },
    {
      title: "Konkurrencer uden bracket",
      value: competitionsWithoutBrackets.length,
      text: competitionsWithoutBrackets[0] ? `${competitionsWithoutBrackets[0].title} · ${competitionsWithoutBrackets[0].event.title}` : "Ingen manglende brackets.",
      href: competitionsWithoutBrackets[0] ? `/competition/events/${competitionsWithoutBrackets[0].event.id}?tab=bracket#bracket` : "/competition/heat-manager",
      action: "Generér bracket",
      tone: "secondary",
    },
    {
      title: "Uafsluttede resultater",
      value: unfinishedResults.length + competitionsAwaitingResults.length,
      text: unfinishedResults[0]
        ? `${unfinishedResults[0].participant.name} · ${unfinishedResults[0].competition.event.title}`
        : competitionsAwaitingResults[0]
          ? `${competitionsAwaitingResults[0].event.title} mangler resultater`
          : "Ingen resultater kræver handling.",
      href: unfinishedResults[0]
        ? `/competition/events/${unfinishedResults[0].competition.event.id}?tab=results#resultater`
        : competitionsAwaitingResults[0]
          ? `/competition/events/${competitionsAwaitingResults[0].event.id}?tab=results#resultater`
          : "/competition/results",
      action: "Indtast resultater",
      tone: "primary",
    },
  ] as const;

  return (
    <AppShell wide>
      <CompetitionLayout>
        <CompetitionPageShell
          eyebrow="DarkLight EventOS"
          title="Eventkontrol"
          subtitle="Fælles databasebaseret kontrolcenter. Alle tal læses fra PostgreSQL, så Cole og Izadora ser samme data."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Events" value={events.length} text="PostgreSQL" />
            <StatCard title="Deltagere" value={participants} text="Alle konkurrencer" />
            <StatCard title="Resultater" value={results} text="Officielle poster" />
            <StatCard title="Sponsorer" value={sponsors} text="Aktive" />
            <StatCard title="Bookinger" value={bookings} text="Forespørgsler" />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Afventer" value={registrationsPending} text="Tilmeldinger" />
            <StatCard title="Inspektion" value={vehicleInspectionsPending} text="Køretøjer" />
            <StatCard title="Aktive konkurrencer" value={activeCompetitions} text="Live EventOS" />
            <StatCard title="Hall of Fame" value={hallOfFameEntries} text="Publicerede" />
            <StatCard title="Tasks" value={tasks.length} text="Åbne opgaver" />
          </div>

          <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
            <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Kræver handling</p>
                <h2 className="mt-3 text-3xl font-black">Approval center</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                  Kun reelle databaseposter vises her. Klik sender staff direkte til den relevante eventsektion.
                </p>
              </div>
              <Link href="/competition/events/create" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
                Opret event
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {actionCards.map((card) => (
                <article key={card.title} className="rounded-[2rem] border border-white/10 bg-black p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{card.title}</p>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">{card.text}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm font-black text-white">{card.value}</span>
                  </div>
                  <Link
                    href={card.href}
                    className={`mt-5 inline-flex w-full items-center justify-center whitespace-nowrap rounded-full px-5 py-3 text-sm font-black transition ${
                      card.tone === "primary" ? "bg-white text-black hover:bg-zinc-300" : "border border-white/10 text-zinc-200 hover:bg-white hover:text-black"
                    }`}
                  >
                    {card.action}
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
            <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
              <h2 className="mb-7 text-3xl font-black">Aktuelt event</h2>
              {activeEvent ? (
                <div className="rounded-[2rem] border border-white/10 bg-black p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{activeEvent.status}</p>
                  <h3 className="mt-3 text-4xl font-black">{activeEvent.title}</h3>
                  <p className="mt-4 text-zinc-500">
                    {activeEvent.startsAt.toLocaleString("da-DK")} · {activeEvent.location ?? "Lokation ikke angivet"}
                  </p>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {activeEvent.competitions.map((competition) => (
                      <div key={competition.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{competition.type}</p>
                        <h4 className="mt-2 font-black">{competition.title}</h4>
                        <p className="mt-2 text-sm text-zinc-500">
                          {competition._count.participants} deltagere · {competition._count.results} resultater
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500">Ingen events i databasen endnu.</p>
              )}
            </section>

            <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
              <h2 className="mb-7 text-3xl font-black">DB-moduler</h2>
              <div className="grid gap-3">
                <ControlLink href="/competition/events" text="Events" />
                <ControlLink href="/competition/drivers" text="Deltagere" />
                <ControlLink href="/competition/results" text="Resultater" />
                <ControlLink href="/competition/tablet" text="Event Tablet" />
                <ControlLink href="/competition/heat-manager" text="Lav køreliste" />
                <ControlLink href="/competition/leaderboard" text="Rangliste" />
                <ControlLink href="/competition/hall-of-fame" text="Hall of Fame" />
                <ControlLink href="/competition/admin" text="Administration" />
              </div>
            </section>
          </div>

          <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
            <h2 className="mb-7 text-3xl font-black">Seneste events</h2>
            <div className="grid gap-5 xl:grid-cols-3">
              {events.slice(0, 6).map((event) => (
                <article key={event.id} className="rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{event.status}</p>
                  <h3 className="mt-3 text-2xl font-black">{event.title}</h3>
                  <p className="mt-2 text-sm text-zinc-500">{event.startsAt.toLocaleString("da-DK")}</p>
                  <Link href={`/competition/events/${event.id}`} className="mt-5 inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                    Åbn event
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
              <h2 className="mb-7 text-3xl font-black">Event tasks</h2>
              <div className="grid gap-3">
                {tasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-white/10 bg-black p-4">
                    <p className="font-black">{task.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {task.event?.title ?? task.entityType ?? "EventOS"} · {task.priority} · {task.status}
                    </p>
                  </div>
                ))}
                {tasks.length === 0 ? <p className="text-zinc-500">Ingen åbne opgaver i databasen.</p> : null}
              </div>
            </section>

            <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
              <h2 className="mb-7 text-3xl font-black">Seneste aktivitet</h2>
              <div className="grid gap-3">
                {recentActivity.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-white/10 bg-black p-4">
                    <p className="font-black">{log.action}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {log.actor?.displayName ?? "System"} · {log.createdAt.toLocaleString("da-DK")}
                    </p>
                  </div>
                ))}
                {recentActivity.length === 0 ? <p className="text-zinc-500">Ingen audit logs endnu.</p> : null}
              </div>
            </section>
          </div>
        </CompetitionPageShell>
      </CompetitionLayout>
    </AppShell>
  );
}

function StatCard({ title, value, text }: { title: string; value: string | number; text: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-3xl font-black">{value}</p>
      <p className="mt-3 text-sm text-zinc-400">{text}</p>
    </div>
  );
}

function ControlLink({ href, text }: { href: string; text: string }) {
  return (
    <Link href={href} className="rounded-full border border-white/10 px-5 py-4 text-center font-black text-white transition hover:bg-white hover:text-black">
      {text}
    </Link>
  );
}
