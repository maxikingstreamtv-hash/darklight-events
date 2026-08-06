import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import CompetitionPageShell from "@/components/competition/layout/CompetitionPageShell";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import { canAccessPath } from "@/lib/auth/rbac";
import { getRegistrationPeriodState, isRegistrationPeriodConfigured } from "@/lib/events/registration-period";
import { getResultProgress } from "@/lib/events/result-sync";

export const dynamic = "force-dynamic";

type DashboardEvent = Awaited<ReturnType<typeof loadDashboardEvents>>[number];
type WorkflowStep = {
  label: string;
  tab: string;
  done: boolean;
  relevant: boolean;
  detail: string;
};
type EventIssue = {
  key: string;
  title: string;
  count?: number;
  tab: string;
  action: string;
  tone: "urgent" | "primary" | "secondary" | "success";
  description: string;
};

export default async function ControlCenterPage() {
  const user = await requireCurrentUser();
  const [
    events,
    participants,
    results,
    sponsors,
    bookings,
    activeCompetitions,
    hallOfFameEntries,
    tasks,
    recentActivity,
  ] = await Promise.all([
    loadDashboardEvents(),
    prisma.participant.count(),
    prisma.result.count(),
    prisma.sponsor.count({ where: { active: true, status: "ACTIVE" } }),
    prisma.bookingRequest.count(),
    prisma.competition.count({ where: { event: { status: "ACTIVE", active: true } } }),
    prisma.hallOfFame.count({ where: { active: true } }),
    prisma.eventTask.findMany({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 6,
      include: { event: { select: { id: true, title: true } } },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { displayName: true } } },
    }),
  ]);

  const now = new Date();
  const activeAndUpcoming = events
    .filter((event) => event.active && ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "UPCOMING", "ACTIVE"].includes(event.status))
    .sort((a, b) => {
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
      if (b.status === "ACTIVE" && a.status !== "ACTIVE") return 1;
      return a.startsAt.getTime() - b.startsAt.getTime();
    });
  const visibleEvents = activeAndUpcoming.slice(0, 8);
  const eventSummaries = visibleEvents.map((event) => summarizeEvent(event));
  const actionItems = eventSummaries.flatMap(({ event, issues }) => issues.map((issue) => ({ event, issue }))).slice(0, 9);
  const pendingRegistrationCount = events.reduce((sum, event) => sum + event.registrations.filter((registration) => registration.status === "PENDING").length, 0);
  const pendingVehicleCount = events.reduce((sum, event) => sum + getPendingVehicleCount(event), 0);
  const upcomingCount = events.filter((event) => event.startsAt >= now && event.active && event.public).length;
  const canOpenAdminVehicles = canAccessPath(user, "/admin/vehicles");
  const quickActions = [
    { label: "Opret event", href: "/competition/events/create", show: canAccessPath(user, "/competition/events/create") },
    { label: "Gennemgå tilmeldinger", href: actionItems.find((item) => item.issue.key === "pending-registrations")?.event.id ? eventTabHref(actionItems.find((item) => item.issue.key === "pending-registrations")!.event.id, "participants") : "/competition/events", show: canAccessPath(user, "/competition/events") },
    { label: "Godkend køretøjer", href: canOpenAdminVehicles ? "/admin/vehicles" : "/competition/events", show: canAccessPath(user, "/competition") },
    { label: "Tilføj præmier", href: actionItems.find((item) => item.issue.key === "missing-prizes")?.event.id ? eventTabHref(actionItems.find((item) => item.issue.key === "missing-prizes")!.event.id, "prizes") : "/competition/events", show: canAccessPath(user, "/competition/events") },
    { label: "Generér køreliste", href: actionItems.find((item) => item.issue.key === "missing-heats")?.event.id ? eventTabHref(actionItems.find((item) => item.issue.key === "missing-heats")!.event.id, "heats") : "/competition/events", show: canAccessPath(user, "/competition/events") },
    { label: "Indtast resultater", href: actionItems.find((item) => item.issue.key === "missing-results")?.event.id ? eventTabHref(actionItems.find((item) => item.issue.key === "missing-results")!.event.id, "results") : "/competition/results", show: canAccessPath(user, "/competition/results") },
  ].filter((action) => action.show);

  return (
    <AppShell wide>
      <CompetitionLayout>
        <CompetitionPageShell
          eyebrow="DarkLight EventOS"
          title="Eventkontrol"
          subtitle="Operationsdashboardet viser kun reelle PostgreSQL-data og sender staff direkte til den relevante Event Center-fane."
          maxWidth="max-w-[1500px]"
          actions={
            <Link href="/competition/events/create" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
              Opret event
            </Link>
          }
        >
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Kommende" value={upcomingCount} text="Aktive public events" />
            <StatCard title="Afventer" value={pendingRegistrationCount} text="Tilmeldinger" />
            <StatCard title="Køretøjer" value={pendingVehicleCount} text="Kræver godkendelse" />
            <StatCard title="Aktive konkurrencer" value={activeCompetitions} text="Live EventOS" />
            <StatCard title="Resultater" value={results} text="Gemte poster" />
          </section>

          <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.35em] text-zinc-500">Kræver handling</p>
                <h2 className="mt-3 text-3xl font-black">Næste opgaver</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                  Prioriteret efter eventets næste manglende trin. Hver knap åbner det præcise event og den rigtige fane.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickActions.slice(0, 3).map((action) => (
                  <Link key={action.label} href={action.href} className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2.5 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {actionItems.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {actionItems.map(({ event, issue }) => (
                  <ActionRequiredCard key={`${event.id}-${issue.key}`} event={event} issue={issue} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6 text-emerald-100">
                <p className="text-xl font-black">Alt er klar – der er ingen ventende opgaver.</p>
                <p className="mt-2 text-sm leading-6 text-emerald-100/75">Der er ingen aktive events med ventende tilmeldinger, manglende kørelister, brackets eller resultater.</p>
              </div>
            )}
          </section>

          <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7">
            <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.35em] text-zinc-500">Events</p>
                <h2 className="mt-3 text-3xl font-black">Kommende og aktive events</h2>
              </div>
              <Link href="/competition/events" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                Se alle events
              </Link>
            </div>

            <div className="grid gap-5">
              {eventSummaries.length > 0 ? (
                eventSummaries.map(({ event, steps, nextStep, progress, pendingRegistrations, pendingVehicles, prizeStatus }) => (
                  <EventOverviewCard
                    key={event.id}
                    event={event}
                    steps={steps}
                    nextStep={nextStep}
                    progress={progress}
                    pendingRegistrations={pendingRegistrations}
                    pendingVehicles={pendingVehicles}
                    prizeStatus={prizeStatus}
                  />
                ))
              ) : (
                <div className="rounded-[2rem] border border-white/10 bg-black p-6">
                  <p className="text-xl font-black">Ingen kommende eller aktive events.</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">Opret eller publicér et event for at starte EventOS-workflowet.</p>
                  <Link href="/competition/events/create" className="mt-5 inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">
                    Opret event
                  </Link>
                </div>
              )}
            </div>
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_420px]">
            <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7">
              <h2 className="mb-6 text-3xl font-black">Hurtige handlinger</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <ControlLink key={action.label} href={action.href} text={action.label} />
                ))}
              </div>
            </section>

            <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7">
              <h2 className="mb-6 text-3xl font-black">Modulstatus</h2>
              <div className="grid gap-3">
                <MiniStat label="Deltagere" value={participants} />
                <MiniStat label="Sponsorer" value={sponsors} />
                <MiniStat label="Hall of Fame" value={hallOfFameEntries} />
                <MiniStat label="Bookinger" value={bookings} />
                <MiniStat label="Tasks" value={tasks.length} />
              </div>
            </section>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7">
              <h2 className="mb-6 text-3xl font-black">Event tasks</h2>
              <div className="grid gap-3">
                {tasks.map((task) => (
                  <Link key={task.id} href={task.eventId ? eventTabHref(task.eventId, "overview") : "/competition/events"} className="rounded-2xl border border-white/10 bg-black p-4 transition hover:border-white/30">
                    <p className="font-black">{task.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {task.event?.title ?? task.entityType ?? "EventOS"} · {task.priority} · {task.status}
                    </p>
                  </Link>
                ))}
                {tasks.length === 0 ? <p className="text-zinc-500">Ingen åbne opgaver i databasen.</p> : null}
              </div>
            </section>

            <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7">
              <h2 className="mb-6 text-3xl font-black">Seneste aktivitet</h2>
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

function loadDashboardEvents() {
  return prisma.event.findMany({
    orderBy: [{ startsAt: "asc" }],
    include: {
      registrations: {
        include: {
          vehicle: {
            select: {
              id: true,
              status: true,
              inspections: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { status: true },
              },
            },
          },
        },
      },
      prizes: {
        where: { active: true },
        select: { id: true, placement: true, prizeType: true, amount: true, sponsorName: true },
      },
      competitions: {
        select: {
          id: true,
          title: true,
          type: true,
          participants: { select: { id: true, status: true } },
          results: { select: { id: true, participantId: true, locked: true, status: true } },
          heats: { select: { id: true, locked: true, status: true } },
          brackets: { select: { id: true, locked: true, status: true } },
        },
      },
      voteCandidates: { where: { active: true, public: true }, select: { id: true, participantId: true } },
      judges: { where: { active: true }, select: { id: true } },
    },
  });
}

function summarizeEvent(event: DashboardEvent) {
  const steps = getWorkflowSteps(event);
  const relevantSteps = steps.filter((step) => step.relevant);
  const doneSteps = relevantSteps.filter((step) => step.done).length;
  const nextStep = relevantSteps.find((step) => !step.done) ?? relevantSteps[relevantSteps.length - 1];
  const issues = getEventIssues(event, steps);

  return {
    event,
    steps: relevantSteps,
    nextStep,
    issues,
    pendingRegistrations: event.registrations.filter((registration) => registration.status === "PENDING").length,
    pendingVehicles: getPendingVehicleCount(event),
    prizeStatus: getPrizeStatus(event),
    progress: Math.round((doneSteps / Math.max(relevantSteps.length, 1)) * 100),
  };
}

function getWorkflowSteps(event: DashboardEvent): WorkflowStep[] {
  const hasCompetitions = event.competitions.length > 0;
  const needsVehicles = event.usesVehicles && event.requiresVehicleApproval;
  const needsHeats = event.usesHeats;
  const needsBracket = event.usesBracket;
  const needsResults = event.usesResults;
  const approvedRegistrations = event.registrations.filter((registration) => registration.status === "APPROVED" || registration.status === "CHECKED_IN").length;
  const pendingRegistrations = event.registrations.filter((registration) => registration.status === "PENDING").length;
  const pendingVehicles = getPendingVehicleCount(event);
  const missingDetails = getMissingDetails(event);
  const heatsReady = !needsHeats || (hasCompetitions && event.competitions.every((competition) => competition.heats.length > 0));
  const bracketsReady = !needsBracket || (hasCompetitions && event.competitions.every((competition) => competition.brackets.length > 0));
  const resultProgress = getResultProgress(event.competitions,{resultMethod:event.resultMethod,usesParticipantRegistration:event.usesParticipantRegistration,candidateCount:event.voteCandidates.length,candidateParticipantIds:event.voteCandidates.flatMap(candidate=>candidate.participantId?[candidate.participantId]:[])});
  const requiresPublication=["PUBLIC_VOTE_ONLY","JUDGE_AND_PUBLIC_VOTE","JUDGE_POINTS"].includes(event.resultMethod);
  const resultsReady = !needsResults || (requiresPublication ? Boolean(event.resultsPublishedAt) : resultProgress.complete);

  return [
    {
      label: "Eventoplysninger",
      tab: "settings",
      done: missingDetails.length === 0,
      relevant: true,
      detail: missingDetails.length ? `${missingDetails.join(", ")} mangler` : "Klar",
    },
    {
      label: "Præmier",
      tab: "prizes",
      done: event.prizes.length > 0,
      relevant: event.usesPrizes,
      detail: getPrizeStatus(event).detail,
    },
    {
      label: "Tilmeldinger",
      tab: "participants",
      done: pendingRegistrations === 0 && approvedRegistrations > 0,
      relevant: event.usesParticipantRegistration,
      detail: pendingRegistrations ? `${pendingRegistrations} afventer` : `${approvedRegistrations} godkendte`,
    },
    {
      label: "Afstemningsbilleder",
      tab: "results",
      done: event.voteCandidates.length > 0,
      relevant: ["PUBLIC_VOTE_ONLY","JUDGE_AND_PUBLIC_VOTE","JUDGE_POINTS"].includes(event.resultMethod),
      detail: event.voteCandidates.length ? `${event.voteCandidates.length} kandidater klar` : "Mangler",
    },
    {
      label: "Dommere",
      tab: "results",
      done: event.judges.length > 0,
      relevant: ["JUDGE_POINTS","JUDGE_AND_PUBLIC_VOTE"].includes(event.resultMethod),
      detail: event.judges.length ? `${event.judges.length} tildelt` : "Mangler",
    },
    {
      label: "Åbn afstemning",
      tab: "results",
      done: Boolean(event.votingOpenAt),
      relevant: ["PUBLIC_VOTE_ONLY","JUDGE_AND_PUBLIC_VOTE"].includes(event.resultMethod),
      detail: event.votingOpenAt ? "Åbnet" : "Ikke åbnet",
    },
    {
      label: "Køretøjer",
      tab: "vehicles",
      done: !needsVehicles || pendingVehicles === 0,
      relevant: needsVehicles,
      detail: pendingVehicles ? `${pendingVehicles} kræver handling` : "Klar",
    },
    {
      label: "Køreliste",
      tab: "heats",
      done: heatsReady,
      relevant: needsHeats,
      detail: heatsReady ? "Klar" : "Mangler",
    },
    {
      label: "Bracket",
      tab: "bracket",
      done: bracketsReady,
      relevant: needsBracket,
      detail: bracketsReady ? "Klar" : "Mangler",
    },
    {
      label: "Resultater",
      tab: "results",
      done: resultsReady,
      relevant: needsResults,
      detail: resultsReady ? "Gemte" : "Mangler",
    },
    {
      label: "Afsluttet",
      tab: "settings",
      done: event.status === "COMPLETED" || event.status === "ARCHIVED",
      relevant: true,
      detail: event.status === "COMPLETED" || event.status === "ARCHIVED" ? "Afsluttet" : resultsReady ? "Klar til afslutning" : "Ikke klar",
    },
  ];
}

function getEventIssues(event: DashboardEvent, steps: WorkflowStep[]): EventIssue[] {
  const issues: EventIssue[] = [];
  const pendingRegistrations = event.registrations.filter((registration) => registration.status === "PENDING").length;
  const pendingVehicles = getPendingVehicleCount(event);
  const missingDetails = getMissingDetails(event);
  const missingStep = (label: string) => steps.find((step) => step.label === label && step.relevant && !step.done);
  const completeStep = steps.find((step) => step.label === "Afsluttet");

  if (event.usesParticipantRegistration && pendingRegistrations > 0) {
    issues.push({
      key: "pending-registrations",
      title: "Tilmeldinger afventer",
      count: pendingRegistrations,
      tab: "participants",
      action: "Godkend nu",
      tone: "urgent",
      description: `${pendingRegistrations} spiller${pendingRegistrations === 1 ? "" : "e"} venter på godkendelse.`,
    });
  }

  if (event.usesVehicles && event.requiresVehicleApproval && pendingVehicles > 0) {
    issues.push({
      key: "pending-vehicles",
      title: "Køretøjer kræver godkendelse",
      count: pendingVehicles,
      tab: "vehicles",
      action: "Åbn køretøjer",
      tone: "urgent",
      description: `${pendingVehicles} eventkøretøj${pendingVehicles === 1 ? "" : "er"} mangler syn eller godkendelse.`,
    });
  }

  if (missingDetails.length > 0) {
    issues.push({
      key: "missing-details",
      title: "Eventoplysninger mangler",
      tab: "settings",
      action: "Udfyld detaljer",
      tone: "secondary",
      description: `${missingDetails.join(", ")} skal udfyldes før eventet føles klar.`,
    });
  }

  if (missingStep("Præmier")) {
    issues.push({
      key: "missing-prizes",
      title: "Præmier mangler",
      tab: "prizes",
      action: "Tilføj præmier",
      tone: "secondary",
      description: getPrizeStatus(event).detail,
    });
  }

  if (missingStep("Køreliste")) {
    issues.push({
      key: "missing-heats",
      title: "Køreliste mangler",
      tab: "heats",
      action: "Lav køreliste",
      tone: "primary",
      description: "Godkendte deltagere skal fordeles i heats.",
    });
  }

  if (missingStep("Bracket")) {
    issues.push({
      key: "missing-bracket",
      title: "Bracket mangler",
      tab: "bracket",
      action: "Generér bracket",
      tone: "primary",
      description: "Eventet har en konkurrencetype, der kræver bracket.",
    });
  }

  if (missingStep("Resultater")) {
    issues.push({
      key: "missing-results",
      title: "Resultater mangler",
      tab: "results",
      action: "Indtast resultater",
      tone: "primary",
      description: "Der findes deltagere, men ingen komplette resultater endnu.",
    });
  }

  if (completeStep && !completeStep.done && completeStep.detail === "Klar til afslutning") {
    issues.push({
      key: "ready-complete",
      title: "Event klar til afslutning",
      tab: "settings",
      action: "Afslut event",
      tone: "success",
      description: "Resultaterne er gemt, og eventet kan finaliseres.",
    });
  }

  return issues;
}

function getMissingDetails(event: DashboardEvent) {
  const missing: string[] = [];
  if (!event.description?.trim()) missing.push("beskrivelse");
  if (!event.location?.trim()) missing.push("lokation");
  if (event.usesParticipantRegistration && !event.maxParticipants) missing.push("kapacitet");
  const registrationPeriod = getRegistrationPeriodState(event);
  if (!isRegistrationPeriodConfigured(registrationPeriod)) missing.push("tilmeldingsperiode");
  return missing;
}

function getPendingVehicleCount(event: DashboardEvent) {
  if (!event.usesVehicles || !event.requiresVehicleApproval) return 0;
  return event.registrations.filter((registration) => {
    if (!registration.vehicle) return false;
    const latestInspection = registration.vehicle.inspections[0];
    return registration.vehicle.status !== "ACTIVE" || !latestInspection || latestInspection.status === "PENDING" || latestInspection.status === "IN_PROGRESS";
  }).length;
}

function getPrizeStatus(event: DashboardEvent) {
  const activePrizes = event.prizes.length;
  return {
    label: activePrizes > 0 ? "Præmier klar" : "Præmier mangler",
    detail: activePrizes > 0 ? `${activePrizes} aktive præmier er konfigureret.` : "Tilføj præmier før eventet åbner for tilmeldinger.",
  };
}

function eventTabHref(eventId: string, tab: string) {
  return `/competition/events/${eventId}?tab=${tab}${tabHash(tab)}`;
}

function tabHash(tab: string) {
  if (tab === "participants") return "#deltagere";
  if (tab === "vehicles") return "#køretøjer";
  if (tab === "prizes") return "#præmier";
  if (tab === "heats") return "#køreliste";
  if (tab === "bracket") return "#bracket";
  if (tab === "results") return "#resultater";
  if (tab === "live") return "#live";
  if (tab === "tablet") return "#tablet";
  if (tab === "settings") return "#indstillinger";
  return "#oversigt";
}

function ActionRequiredCard({ event, issue }: { event: DashboardEvent; issue: EventIssue }) {
  return (
    <article className={`rounded-[2rem] border p-5 ${issue.tone === "urgent" ? "border-red-400/25 bg-red-400/10" : issue.tone === "success" ? "border-emerald-400/25 bg-emerald-400/10" : "border-white/10 bg-black"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">{event.title}</p>
          <h3 className="mt-3 text-xl font-black">{issue.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{issue.description}</p>
        </div>
        {typeof issue.count === "number" ? <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm font-black">{issue.count}</span> : null}
      </div>
      <Link href={eventTabHref(event.id, issue.tab)} className="mt-5 inline-flex w-full items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">
        {issue.action}
      </Link>
    </article>
  );
}

function EventOverviewCard({
  event,
  steps,
  nextStep,
  progress,
  pendingRegistrations,
  pendingVehicles,
  prizeStatus,
}: {
  event: DashboardEvent;
  steps: WorkflowStep[];
  nextStep: WorkflowStep;
  progress: number;
  pendingRegistrations: number;
  pendingVehicles: number;
  prizeStatus: { label: string; detail: string };
}) {
  const approvedCount = event.registrations.filter((registration) => registration.status === "APPROVED" || registration.status === "CHECKED_IN").length;
  const capacity = event.maxParticipants ? `${event.registrations.length} / ${event.maxParticipants}` : `${event.registrations.length}`;
  const category = event.competitions[0]?.type ?? "Event";

  return (
    <article className="rounded-[2rem] border border-white/10 bg-black p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_260px] xl:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{event.status}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">{category}</span>
          </div>
          <h3 className="mt-4 text-3xl font-black">{event.title}</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            {event.startsAt.toLocaleString("da-DK")} · {event.location ?? "Lokation mangler"}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat label="Kapacitet" value={capacity} />
            <MiniStat label="Afventer" value={pendingRegistrations} />
            <MiniStat label="Køretøjer" value={pendingVehicles ? `${pendingVehicles} afventer` : "Klar"} />
            <MiniStat label="Præmier" value={prizeStatus.label} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Næste handling</p>
          <h4 className="mt-3 text-xl font-black">{nextStep.label}</h4>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{nextStep.detail}</p>
          <Link href={eventTabHref(event.id, nextStep.tab)} className="mt-4 inline-flex w-full items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">
            Åbn Event Center
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-4 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
          <span>Workflow</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <Link key={step.label} href={eventTabHref(event.id, step.tab)} className={`rounded-2xl border p-3 transition hover:border-white/40 ${step.done ? "border-emerald-400/20 bg-emerald-400/10" : step === nextStep ? "border-yellow-300/30 bg-yellow-300/10" : "border-white/10 bg-white/[0.03]"}`}>
              <p className="text-sm font-black">{step.done ? "✓ " : ""}{step.label}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{step.detail}</p>
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-5 text-xs text-zinc-600">Godkendte deltagere: {approvedCount}</p>
    </article>
  );
}

function StatCard({ title, value, text }: { title: string; value: string | number; text: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">{title}</p>
      <p className="mt-4 text-3xl font-black">{value}</p>
      <p className="mt-3 text-sm text-zinc-400">{text}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-2 font-black text-white">{value}</p>
    </div>
  );
}

function ControlLink({ href, text }: { href: string; text: string }) {
  return (
    <Link href={href} className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 text-center font-black text-white transition hover:bg-white hover:text-black">
      {text}
    </Link>
  );
}
