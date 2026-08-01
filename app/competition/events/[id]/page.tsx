import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import EventImageUpload from "@/components/events/EventImageUpload";
import EventFeatureFields from "@/components/events/EventFeatureFields";
import EventImage from "@/components/events/EventImage";
import EventPrizeForm from "@/components/events/EventPrizeForm";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import { canManageEventCommandCenter, canUseDangerousEventActions, commandCenterHref, getCommandCenterTabs, resolveCommandCenterTab } from "@/lib/events/command-center";
import type { EventFeatures } from "@/lib/events/event-features";
import { filterAndSortParticipants } from "@/lib/events/command-center-operations";
import { getPublicPrizes, groupPrizesByPlacement, MAX_PRIZE_PARTS_PER_PLACEMENT } from "@/lib/events/prize-rules";
import { formatPrizeCurrency } from "@/lib/events/prize-currency";
import { serializeEventPrizeForClient } from "@/lib/events/prize-serialization";
import { getRegistrationPeriodState, isRegistrationPeriodConfigured } from "@/lib/events/registration-period";
import { getResultProgress } from "@/lib/events/result-sync";
import { formatResultTime } from "@/lib/events/result-time";
import { hasPrizePlacementMismatch } from "@/lib/events/result-history";
import {
  archiveCompetitionEventAction,
  deleteCompetitionEventAction,
  setEventRegistrationStatusAction,
  updateCompetitionEventImageAction,
  updateCompetitionEventAction,
} from "@/app/competition/events/actions";
import {
  addManualParticipantAction,
  addHeatEntryAction,
  approveAllPendingRegistrationsAction,
  bulkUpdateEventVehiclesAction,
  bulkUpdateRegistrationsAction,
  assignEventPrizeWinnerAction,
  completeEventAction,
  createEventPrizeAction,
  deactivateEventPrizeAction,
  deleteEventPrizeAction,
  deleteHeatAction,
  createAnnouncementAction,
  generateBracketAction,
  generateHeatsAction,
  lockCompetitionResultsAction,
  lockHeatsAction,
  moveHeatEntryAction,
  moveHeatEntryToHeatAction,
  moveEventPrizeAction,
  saveAllResultsAction,
  saveResultAction,
  resetBracketAction,
  resetHeatsAction,
  removeHeatEntryAction,
  removeParticipantAction,
  selectMatchWinnerAction,
  setBracketLockAction,
  toggleEventPrizeVisibilityAction,
  unassignEventPrizeWinnerAction,
  unlockCompetitionResultsAction,
  unlockHeatsAction,
  updateParticipantNoteAction,
  updateEventPrizeAction,
  updateEventVehicleNoteAction,
  updateEventVehicleStatusAction,
  updateRegistrationStatusAction,
  duplicateEventAction,
} from "@/app/competition/eventos-actions";

export const dynamic = "force-dynamic";

function toInputDate(value: Date | null) {
  if (!value) return "";
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

type EventDetailsSearchParams = {
  tab?: string | string[];
  saved?: string | string[];
  q?: string | string[];
  status?: string | string[];
  sort?: string | string[];
  missingVehicle?: string | string[];
  resultQ?: string | string[];
  resultFilter?: string | string[];
  prizePlacement?: string | string[];
};

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function tabHash(tab: string) {
  if (tab === "overview") return "#oversigt";
  if (tab === "details") return "#eventoplysninger";
  if (tab === "participants") return "#deltagere";
  if (tab === "vehicles") return "#køretøjer";
  if (tab === "prizes") return "#præmier";
  if (tab === "heats") return "#køreliste";
  if (tab === "bracket") return "#bracket";
  if (tab === "results") return "#resultater";
  if (tab === "live") return "#live";
  if (tab === "tablet") return "#tablet";
  if (tab === "settings") return "#indstillinger";
  if (tab === "media") return "#medier";
  return "#oversigt";
}

export default async function EventDetailsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<EventDetailsSearchParams> }) {
  const currentUser = await requireCurrentUser();
  if (!canManageEventCommandCenter(currentUser.role)) redirect("/forbidden");
  const { id } = await params;
  const query = await searchParams;
  const activeTab = readParam(query.tab) || "overview";
  const savedState = readParam(query.saved);
  const participantQuery = readParam(query.q);
  const participantStatus = readParam(query.status) || "ALL";
  const participantSort = readParam(query.sort) || "date";
  const participantMissingVehicle = readParam(query.missingVehicle) === "1";
  const resultQuery = readParam(query.resultQ);
  const resultFilter = readParam(query.resultFilter) || "ALL";
  const requestedPrizePlacementValue = Number(readParam(query.prizePlacement));
  const requestedPrizePlacement = Number.isInteger(requestedPrizePlacementValue) && requestedPrizePlacementValue > 0 ? requestedPrizePlacementValue : null;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        orderBy: [{ createdAt: "desc" }],
        include: {
          user: { select: { displayName: true, username: true, darklightId: true, avatar: true } },
          vehicle: {
            select: {
              id: true,
              displayName: true,
              licensePlate: true,
              vehicleClass: true,
              eventCategory: true,
              status: true,
              inspections: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: {
                  id: true,
                  status: true,
                  notes: true,
                  items: { select: { result: true } },
                },
              },
            },
          },
        },
      },
      competitions: {
        include: {
          participants: { orderBy: [{ seed: "asc" }, { createdAt: "asc" }] },
          results: true,
          heats: {
            orderBy: [{ round: "asc" }, { heatNumber: "asc" }],
            include: { entries: { orderBy: { startPosition: "asc" }, include: { participant: true } } },
          },
          brackets: {
            orderBy: { createdAt: "desc" },
            include: {
              matches: {
                orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
                include: { participantA: true, participantB: true, winner: true },
              },
            },
          },
        },
      },
      prizes: {
        orderBy: [{ sortOrder: "asc" }, { placement: "asc" }, { createdAt: "asc" }],
        include: {
          winners: {
            include: {
              participant: { select: { id: true, name: true, userId: true } },
              user: { select: { id: true, displayName: true, darklightId: true } },
            },
          },
        },
      },
      announcements: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: [{ priority: "desc" }, { createdAt: "desc" }] },
      _count: { select: { gallery: true } },
    },
  });

  if (!event) {
    notFound();
  }
  const disciplines = await prisma.discipline.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const eventActivity = await prisma.auditLog.findMany({
    where: { target: { in: [
      `Event:${event.id}`,
      `event:${event.id}`,
      ...event.registrations.map((registration) => `EventRegistration:${registration.id}`),
      ...event.competitions.map((competition) => `Competition:${competition.id}`),
      ...event.competitions.flatMap((competition) => competition.results.map((result) => `Result:${result.id}`)),
      ...event.prizes.map((prize) => `EventPrize:${prize.id}`),
    ] } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { actor: { select: { displayName: true } } },
  });

  const eventFeatures = {
    usesParticipantRegistration: event.usesParticipantRegistration,
    usesVehicles: event.usesVehicles,
    requiresVehicleApproval: event.requiresVehicleApproval,
    usesHeats: event.usesHeats,
    usesBracket: event.usesBracket,
    usesResults: event.usesResults,
    usesPrizes: event.usesPrizes,
  };
  const visibleTabs = getCommandCenterTabs(eventFeatures);
  const currentTab = resolveCommandCenterTab(activeTab, eventFeatures);
  const updateAction = updateCompetitionEventAction.bind(null, event.id);
  const archiveAction = archiveCompetitionEventAction.bind(null, event.id);
  const deleteAction = deleteCompetitionEventAction.bind(null, event.id);
  const announcementAction = createAnnouncementAction.bind(null, event.id);
  const completeAction = completeEventAction.bind(null, event.id);
  const openRegistrationAction = setEventRegistrationStatusAction.bind(null, event.id, "open");
  const closeRegistrationAction = setEventRegistrationStatusAction.bind(null, event.id, "closed");
  const duplicateAction = duplicateEventAction.bind(null, event.id);
  const canUseDangerousActions = canUseDangerousEventActions(currentUser.role);
  const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const approvedRegistrationItems = event.registrations.filter((registration) => registration.status === "APPROVED" || registration.status === "CHECKED_IN");
  const pendingRegistrationItems = event.registrations.filter((registration) => registration.status === "PENDING");
  const visibleRegistrations = filterAndSortParticipants(event.registrations, {
    query: participantQuery,
    status: participantStatus,
    sort: participantSort === "name" || participantSort === "status" ? participantSort : "date",
    missingVehicle: participantMissingVehicle,
  });
  const visibleManualParticipants = event.competitions
    .flatMap((competition) => competition.participants.map((participant) => ({ ...participant, competitionTitle: competition.title })))
    .filter((participant) => !participant.userId)
    .filter(() => participantStatus === "ALL" || participantStatus === "MANUAL")
    .filter((participant) => !participantQuery || [participant.name, participant.number, participant.vehicle].filter(Boolean).some((value) => String(value).toLocaleLowerCase("da-DK").includes(participantQuery.toLocaleLowerCase("da-DK"))))
    .sort((a, b) => participantSort === "name" ? a.name.localeCompare(b.name, "da") : b.createdAt.getTime() - a.createdAt.getTime());
  const rejectedRegistrations = event.registrations.filter((registration) => registration.status === "REJECTED").length;
  const checkedInRegistrations = event.registrations.filter((registration) => registration.status === "CHECKED_IN").length;
  const approvedRegistrations = approvedRegistrationItems.length;
  const pendingRegistrations = pendingRegistrationItems.length;
  const capacityRemaining = event.maxParticipants ? Math.max(event.maxParticipants - approvedRegistrations, 0) : "Ubegrænset";
  const eventVehicles = event.registrations.filter((registration) => registration.vehicle);
  const activePrizes = getPublicPrizes(event.prizes);
  const prizeGroups = groupPrizesByPlacement(event.prizes);
  const prizeGroupsByPlacement = new Map(prizeGroups.map((group) => [group.placement, group]));
  const numericPrizePlacements = [...new Set([
    1, 2, 3, 4, 5, 6,
    ...event.prizes.flatMap((prize) => prize.placement === null ? [] : [prize.placement]),
    ...(requestedPrizePlacement === null ? [] : [requestedPrizePlacement]),
  ])].sort((left, right) => left - right);
  const placementPrizeGroups = numericPrizePlacements.map((placement) => prizeGroupsByPlacement.get(placement) ?? {
    key: `placement-${placement}`,
    placement,
    label: `${placement}. plads`,
    prizes: [],
  });
  const specialPrizeGroup = prizeGroupsByPlacement.get(null) ?? {
    key: "special",
    placement: null,
    label: "Særpræmier",
    prizes: [],
  };
  const cashTotal = activePrizes.reduce((sum, prize) => sum + Number(prize.amount ?? 0), 0);
  const placementsCovered = activePrizes
    .filter((prize) => prize.placement)
    .map((prize) => prize.placement)
    .sort((a, b) => Number(a) - Number(b));
  const specialPrizeCount = activePrizes.filter((prize) => !prize.placement || prize.prizeType === "SPECIAL").length;
  const sponsorPrizeCount = activePrizes.filter((prize) => prize.prizeType === "SPONSOR" || prize.sponsorName).length;
  const pendingVehicles = eventVehicles.filter((registration) => {
    const latestInspection = registration.vehicle?.inspections[0];
    return registration.vehicle?.status !== "ACTIVE" || !latestInspection || latestInspection.status === "PENDING" || latestInspection.status === "IN_PROGRESS";
  }).length;
  const approvedVehicles = eventVehicles.filter((registration) => {
    const latestInspection = registration.vehicle?.inspections[0];
    return registration.vehicle?.status === "ACTIVE" && latestInspection?.status === "APPROVED";
  }).length;
  const missingVehicleAssignments = approvedRegistrationItems.filter((registration) => !registration.vehicle).length;
  const competitionTypes = new Set<string>(event.competitions.map((competition) => competition.type));
  const hasCompetition = event.competitions.length > 0;
  const requiresVehicles = event.usesVehicles;
  const requiresHeats = event.usesHeats;
  const requiresBracket = event.usesBracket;
  const requiresJudging = competitionTypes.has("CAR_SHOW");
  const heatCompetitions = event.competitions;
  const bracketCompetitions = event.competitions;
  const registrationPeriodState = getRegistrationPeriodState(event);
  const eventDetailMissing = [
    !event.title ? "titel" : null,
    !event.description ? "beskrivelse" : null,
    !event.startsAt ? "dato" : null,
    !event.location ? "lokation" : null,
    !event.maxParticipants ? "kapacitet" : null,
    !isRegistrationPeriodConfigured(registrationPeriodState) ? "tilmeldingsperiode" : null,
  ].filter(Boolean);
  const heatsGenerated = !requiresHeats || (heatCompetitions.length > 0 && heatCompetitions.every((competition) => competition.heats.length > 0));
  const bracketsGenerated = !requiresBracket || (bracketCompetitions.length > 0 && bracketCompetitions.every((competition) => competition.brackets.length > 0));
  const resultProgress = getResultProgress(event.competitions);
  const totalResultParticipants = resultProgress.readyParticipants;
  const totalResults = resultProgress.completedResults;
  const resultsEntered = !event.usesResults || resultProgress.complete;
  const missingResults = event.usesResults ? resultProgress.missingResults : 0;
  const allResultsLocked = totalResults > 0 && event.competitions.flatMap((competition) => competition.results).every((result) => result.locked);
  const assignedPrizeCount = event.prizes.filter((prize) => prize.active && prize.winners.length > 0).length;
  const missingPrizeAssignments = event.prizes.filter((prize) => prize.active && prize.winners.length === 0).length;
  const eventCompleted = event.status === "COMPLETED" || event.status === "ARCHIVED";
  const resultReady = resultProgress.hasParticipants;
  const prizeWinnerOptions = event.competitions.flatMap((competition) => competition.participants.filter((participant) => participant.status === "APPROVED" || participant.status === "CHECKED_IN").map((participant) => ({ ...participant, competitionTitle: competition.title })));
  const resultSetupMessage = event.competitions.length === 0
    ? "Resultatgrundlaget klargøres automatisk."
    : totalResultParticipants === 0
      ? "Der er endnu ingen godkendte deltagere, som kan få registreret resultater."
      : "Køreliste kan oprettes først, men du kan også gemme resultater direkte på godkendte deltagere.";
  const workflowSteps = [
    { label: "Eventoplysninger", done: eventDetailMissing.length === 0, href: "details", detail: eventDetailMissing.length ? `Mangler: ${eventDetailMissing.join(", ")}` : "Basisdata er klar", action: "Udfyld eventoplysninger" },
    { label: "Præmier", done: activePrizes.length > 0, href: "prizes", detail: activePrizes.length ? `${activePrizes.length} aktive præmier` : "Præmier mangler", action: "Tilføj præmier", relevant: event.usesPrizes },
    { label: "Tilmeldinger", done: approvedRegistrations > 0 && pendingRegistrations === 0, href: "participants", detail: pendingRegistrations ? `${pendingRegistrations} afventer` : `${approvedRegistrations} godkendte`, action: pendingRegistrations ? "Gennemgå tilmeldinger" : "Åbn deltagere", relevant: event.usesParticipantRegistration },
    { label: "Køretøjer", done: !event.requiresVehicleApproval || (missingVehicleAssignments === 0 && pendingVehicles === 0 && approvedVehicles > 0), href: "vehicles", detail: missingVehicleAssignments ? `${missingVehicleAssignments} mangler køretøj` : pendingVehicles ? `${pendingVehicles} kræver syn` : `${approvedVehicles} godkendte`, action: "Godkend køretøjer", relevant: event.usesVehicles && event.requiresVehicleApproval },
    { label: "Køreliste", done: heatsGenerated, href: "heats", detail: !requiresHeats ? "Ikke påkrævet" : heatsGenerated ? "Køreliste klar" : "Køreliste mangler", action: "Generér køreliste", relevant: requiresHeats },
    { label: "Bracket", done: bracketsGenerated, href: "bracket", detail: !requiresBracket ? "Ikke påkrævet" : bracketsGenerated ? "Bracket klar" : "Bracket mangler", action: "Generér bracket", relevant: requiresBracket },
    { label: requiresJudging ? "Bedømmelse" : "Resultater", done: resultsEntered, href: "results", detail: resultsEntered ? "Resultater gemt" : resultSetupMessage, action: requiresJudging ? "Indtast bedømmelse" : "Indtast resultater", relevant: event.usesResults },
    { label: "Afsluttet", done: eventCompleted, href: "settings", detail: eventCompleted ? event.status : "Afventer færdiggørelse", action: "Afslut event" },
  ].filter((step) => step.relevant !== false);
  const completionBlockers = workflowSteps.filter((step) => step.label !== "Afsluttet" && !step.done);
  const eventCanComplete = completionBlockers.length === 0 && !eventCompleted;
  const currentStepIndex = workflowSteps.findIndex((step) => !step.done);
  const nextStep = workflowSteps[currentStepIndex === -1 ? workflowSteps.length - 1 : currentStepIndex];

  return (
    <main className="min-h-screen bg-black text-white">
      <CompetitionLayout>
        <section className="relative overflow-hidden px-6 py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative mx-auto max-w-[1500px]">
            <Link href="/competition/events" className="mb-10 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-300 transition hover:bg-white hover:text-black">
              Tilbage til events
            </Link>

            <header className="mb-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <div className="grid lg:grid-cols-[320px_1fr]">
                <div className="relative aspect-video overflow-hidden bg-black lg:aspect-auto lg:min-h-80">
                  <EventImage src={event.bannerUrl} alt={event.imageAlt ?? event.title} variant="banner" />
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-300">{commandCenterStatusLabel(event.status)}</span>
                        <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-300">{event.public && event.active ? "Offentlig" : "Privat"}</span>
                      </div>
                      <h1 className="mt-4 text-4xl font-black md:text-6xl">{event.title}</h1>
                      <p className="mt-3 text-sm text-zinc-400">{event.startsAt.toLocaleString("da-DK")} · {event.location ?? "Lokation ikke angivet"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={commandCenterHref(event.id, "details")} className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-black">Gem ændringer</Link>
                      <Link href={`/events/${event.id}`} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-zinc-200">Se offentlig eventside</Link>
                      {event.status === "REGISTRATION_OPEN" ? (
                        <form action={closeRegistrationAction}><button className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-zinc-200">Luk tilmelding</button></form>
                      ) : event.usesParticipantRegistration ? (
                        <form action={openRegistrationAction}><button className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-zinc-200">Åbn tilmelding</button></form>
                      ) : null}
                      <form action={duplicateAction}><button className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-zinc-200">Duplikér event</button></form>
                      {!eventCompleted ? <Link href={commandCenterHref(event.id, "settings")} className="rounded-full border border-emerald-400/30 px-5 py-2.5 text-sm font-black text-emerald-200">Afslut event</Link> : null}
                      <Link href={commandCenterHref(event.id, "settings")} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-zinc-200">Flere handlinger</Link>
                    </div>
                  </div>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MiniStat label="Tilmeldinger" value={event.registrations.length} />
                    <MiniStat label="Kapacitet" value={event.maxParticipants ? `${event.registrations.length}/${event.maxParticipants}` : "Ubegrænset"} />
                    <MiniStat label="Ledige pladser" value={capacityRemaining} />
                    <MiniStat label="Næste handling" value={nextStep.label} />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {activeFeatureLabels(eventFeatures).map((label) => <span key={label} className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-400">{label}</span>)}
                  </div>
                </div>
              </div>
            </header>

            <nav aria-label="Event Center sektioner" className="mb-8 flex gap-2 overflow-x-auto rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visibleTabs.map((tab) => (
                <Link
                  key={tab.key}
                  href={commandCenterHref(event.id, tab.key)}
                  className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-black transition ${
                    currentTab === tab.key ? "border-white bg-white text-black" : "border-white/10 text-zinc-300 hover:bg-white hover:text-black"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>

            <section aria-label="Eventflow" className="mb-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">Eventflow</p>
                  <h2 className="mt-2 text-2xl font-black">Næste: {nextStep.label}</h2>
                </div>
                <Link href={`/competition/events/${event.id}?tab=${nextStep.href}${tabHash(nextStep.href)}`} className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">
                  {nextStep.action}
                </Link>
              </div>
              <div className="grid gap-3 lg:grid-cols-4 2xl:grid-cols-8">
                {workflowSteps.map((step, index) => (
                  <WorkflowStepLink
                    key={step.label}
                    eventId={event.id}
                    index={index}
                    step={step}
                    state={step.done ? "completed" : index === currentStepIndex ? "current" : "blocked"}
                  />
                ))}
              </div>
            </section>

            {currentTab === "overview" ? <div id="oversigt" className="grid scroll-mt-8 gap-8 xl:grid-cols-[1fr_380px]">
              <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">{event.status}</p>
                <h1 className="mt-4 text-5xl font-black md:text-7xl">{event.title}</h1>
                <p className="mt-6 max-w-3xl leading-7 text-zinc-400">{event.description}</p>
                <div className="mt-8 grid gap-4 md:grid-cols-4">
                  <MiniStat label="Dato" value={event.startsAt.toLocaleString("da-DK")} />
                  <MiniStat label="Lokation" value={event.location ?? "Ikke angivet"} />
                  <MiniStat label="Tilmeldinger" value={event.registrations.length} />
                  <MiniStat label="Public" value={event.public && event.active ? "Ja" : "Nej"} />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <MiniStat label="Afventer" value={pendingRegistrations} />
                  <MiniStat label="Køretøjer klar" value={requiresVehicles ? `${approvedVehicles}/${approvedRegistrations}` : "Ikke påkrævet"} />
                  <MiniStat label="Præmier" value={activePrizes.length ? "Klar" : "Mangler"} />
                  <MiniStat label="Afslutning" value={eventCompleted ? "Afsluttet" : eventCanComplete ? "Klar" : `${completionBlockers.length} mangler`} />
                </div>
                <div className="mt-8 rounded-[2rem] border border-white/10 bg-black p-5">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Næste handling</p>
                  <h2 className="mt-3 text-2xl font-black">{nextStep.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{nextStep.detail}</p>
                  <Link href={`/competition/events/${event.id}?tab=${nextStep.href}${tabHash(nextStep.href)}`} className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">
                    {nextStep.action}
                  </Link>
                </div>
                <div className="mt-6 grid gap-3">
                  {workflowSteps.map((step, index) => (
                    <Link key={step.label} href={`/competition/events/${event.id}?tab=${step.href}${tabHash(step.href)}`} className="grid gap-3 rounded-2xl border border-white/10 bg-black p-4 transition hover:border-white/30 md:grid-cols-[44px_1fr_auto] md:items-center">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${step.done ? "bg-emerald-400 text-black" : index === currentStepIndex ? "bg-yellow-300 text-black" : "bg-white/10 text-zinc-400"}`}>
                        {step.done ? "✓" : index + 1}
                      </span>
                      <span>
                        <span className="block font-black">{step.label}</span>
                        <span className="mt-1 block text-xs text-zinc-500">{step.detail}</span>
                      </span>
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Åbn</span>
                    </Link>
                  ))}
                </div>
              </section>

              <aside className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
                <h2 className="text-3xl font-black">EventOS status</h2>
                <div className="mt-6 grid gap-3">
                  <MiniStat label="Konkurrencer" value={event.competitions.length} />
                  <MiniStat label="Tilmeldinger" value={event.registrations.length} />
                  <MiniStat label="Godkendte deltagere" value={approvedRegistrations} />
                  <MiniStat label="Ledige pladser" value={capacityRemaining} />
                  <MiniStat label="Køreliste" value={heatsGenerated ? "Klar" : requiresHeats ? "Mangler" : "Ikke relevant"} />
                  <MiniStat label="Bracket" value={bracketsGenerated ? "Klar" : requiresBracket ? "Mangler" : "Ikke relevant"} />
                  <MiniStat label="Resultater" value={resultsEntered ? "Gemte" : hasCompetition ? "Mangler" : "Ingen konkurrence"} />
                  <MiniStat label="Manglende resultater" value={missingResults} />
                  <MiniStat label="Resultatlås" value={!event.usesResults ? "Ikke relevant" : allResultsLocked ? "Låst" : "Ulåst"} />
                  <MiniStat label="Præmier tildelt" value={`${assignedPrizeCount}/${activePrizes.length}`} />
                  <MiniStat label="Manglende præmietildelinger" value={missingPrizeAssignments} />
                  <MiniStat label="Eventbillede" value={event.bannerUrl ? "Klar" : "Mangler"} />
                  <MiniStat label="Galleri" value={event._count.gallery} />
                </div>
                {!event.bannerUrl ? <div className="mt-5 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm font-black text-yellow-100">Eventet mangler et offentligt billede. Placeholder vises indtil et billede gemmes.</div> : null}
                {!blobConfigured ? <div className="mt-3 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm text-yellow-100">Billedlager er ikke konfigureret endnu.</div> : null}
                <Link href={`/events/${event.id}`} className="mt-6 inline-flex min-w-40 items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">
                  Åbn public event
                </Link>
                <div className="mt-5 rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Præmier</p>
                  <h3 className="mt-3 text-xl font-black">{activePrizes.length > 0 ? "Præmier klar" : "Præmier mangler"}</h3>
                  <div className="mt-3 grid gap-2 text-sm text-zinc-500">
                    <p>Antal: {activePrizes.length}</p>
                    <p>Kontantværdi: {cashTotal > 0 ? `${formatPrizeCurrency(cashTotal, activePrizes.find((prize) => prize.amount)?.currency ?? "DKK")}` : "Ikke angivet"}</p>
                    <p>Placeringer: {placementsCovered.length ? placementsCovered.map((placement) => `${placement}. plads`).join(", ") : "Ingen"}</p>
                    <p>Specialpræmier: {specialPrizeCount}</p>
                    <p>Sponsorpræmier: {sponsorPrizeCount}</p>
                  </div>
                  <Link href={`/competition/events/${event.id}?tab=prizes#præmier`} className="mt-4 inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                    Åbn præmier
                  </Link>
                </div>
                <div className="mt-5 rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Hurtig handling</p>
                  <h3 className="mt-3 text-xl font-black">Indtast point og tider</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{resultReady ? "Åbn resultatfanen for dette event." : resultSetupMessage}</p>
                  <Link href={`/competition/events/${event.id}?tab=results#resultater`} className="mt-4 inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                    {resultReady ? "Indtast resultater" : "Gå til opsætning"}
                  </Link>
                </div>
                {eventCanComplete ? (
                  <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                    <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/70">Klar til afslutning</p>
                    <h3 className="mt-3 text-xl font-black text-emerald-100">Afslut event</h3>
                    <p className="mt-2 text-sm leading-6 text-emerald-100/75">
                      Dette låser resultater, lukker tilmeldingen og markerer eventet som afsluttet.
                    </p>
                    <Link href={`/competition/events/${event.id}?tab=settings#indstillinger`} className="mt-4 inline-flex w-full items-center justify-center whitespace-nowrap rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-black transition hover:bg-emerald-200">
                      Gå til afslutning
                    </Link>
                  </div>
                ) : null}
              </aside>
            </div> : null}

            {currentTab === "details" ? <section id="eventoplysninger" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <h2 className="mb-2 text-3xl font-black">Eventoplysninger</h2>
              <p className="mb-7 text-sm text-zinc-500">Rediger eventets oplysninger direkte i Command Center.</p>
              {savedState === "1" ? <p className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-black text-emerald-200">Ændringerne er gemt.</p> : null}
              <form id="event-details-form" action={updateAction} className="grid gap-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  <Field label="Titel" name="title" defaultValue={event.title} />
                  <Field label="Lokation" name="location" defaultValue={event.location ?? ""} />
                  <Field label="Dato og tid" name="startsAt" type="datetime-local" defaultValue={toInputDate(event.startsAt)} />
                  <Field label="Slut" name="endsAt" type="datetime-local" defaultValue={toInputDate(event.endsAt)} />
                  <Field label="Tilmelding åbner" name="registrationOpenAt" type="datetime-local" defaultValue={toInputDate(event.registrationOpenAt)} />
                  <Field label="Tilmelding lukker" name="registrationCloseAt" type="datetime-local" defaultValue={toInputDate(event.registrationCloseAt)} />
                  <Field label="Maks deltagere" name="maxParticipants" type="number" defaultValue={event.maxParticipants?.toString() ?? ""} />
                  <Field label="Sortering" name="sortOrder" type="number" defaultValue={String(event.sortOrder)} />
                  <Field label="Alt-tekst" name="imageAlt" defaultValue={event.imageAlt ?? ""} />
                  <label className="grid gap-2 text-sm font-bold text-zinc-300">
                    Status
                    <select name="status" defaultValue={event.status} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none">
                      {["DRAFT", "PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED", "ARCHIVED"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-bold text-zinc-300">
                  Beskrivelse
                  <textarea name="description" defaultValue={event.description} rows={5} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none" />
                </label>
                <EventImageUpload eventId={event.id} initialUrl={event.bannerUrl ?? ""} initialFocusX={event.imageFocusX} initialFocusY={event.imageFocusY} />
                <EventFeatureFields initial={eventFeatures} disciplines={disciplines} selectedDisciplineId={event.disciplineId ?? ""} />
                <div className="flex flex-wrap gap-5">
                  <label className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                    <input name="active" type="checkbox" defaultChecked={event.active} /> Aktiv
                  </label>
                  <label className="flex items-center gap-3 text-sm font-bold text-zinc-300">
                    <input name="public" type="checkbox" defaultChecked={event.public} /> Offentlig
                  </label>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300" type="submit">Gem event</button>
                </div>
              </form>
            </section> : null}

            {currentTab === "settings" ? <section id="indstillinger" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <h2 className="text-3xl font-black">Indstillinger og afslutning</h2>
              <p className="mt-3 text-sm text-zinc-500">Status, arkivering og farlige handlinger er samlet her. Eventfunktioner redigeres under Eventoplysninger.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <form action={archiveAction}><button className="rounded-full border border-orange-400/30 px-6 py-3 font-black text-orange-200" type="submit">Arkivér event</button></form>
                <form action={duplicateAction}><button className="rounded-full border border-white/15 px-6 py-3 font-black text-zinc-200" type="submit">Duplikér event</button></form>
              </div>
              <div className="mt-8 rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-100/70">Afslutning</p>
                <h3 className="mt-3 text-2xl font-black text-emerald-100">Afslut event</h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-100/75">
                  Dette låser resultater, lukker tilmeldingen, opdaterer eventstatus til afsluttet og efterlader historiske data intakte.
                </p>
                <form action={completeAction} className="mt-5">
                  <label className="mb-4 flex items-start gap-3 text-sm font-bold leading-6 text-emerald-100/80">
                    <input name="confirmComplete" type="checkbox" className="mt-1" />
                    Jeg bekræfter, at resultater skal låses, tilmeldingen lukkes, og eventet markeres som afsluttet.
                  </label>
                  <button
                    disabled={!eventCanComplete}
                    className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-emerald-300 px-6 py-3 font-black text-black transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40"
                    type="submit"
                  >
                    Afslut event
                  </button>
                </form>
                {!eventCanComplete && !eventCompleted ? (
                  <div className="mt-5 rounded-2xl border border-emerald-100/10 bg-black/40 p-4">
                    <p className="text-sm font-black text-emerald-100">Eventet kan ikke afsluttes endnu.</p>
                    <ul className="mt-3 grid gap-2 text-sm text-emerald-100/70">
                      {completionBlockers.map((blocker) => (
                        <li key={blocker.label}>• {blocker.label}: {blocker.detail}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="mt-5 rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Seneste eventaktivitet</p>
                  <div className="mt-4 grid gap-3">
                    {eventActivity.slice(0, 8).map((entry) => (
                      <div key={entry.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                        <p className="text-sm font-black text-zinc-200">{auditActionLabel(entry.action)}</p>
                        <p className="mt-1 text-xs text-zinc-500">{entry.actor?.displayName ?? "System"} · {entry.createdAt.toLocaleString("da-DK")}</p>
                      </div>
                    ))}
                    {eventActivity.length === 0 ? <p className="text-sm text-zinc-500">Ingen aktivitet registreret endnu.</p> : null}
                  </div>
                </div>
              </div>
              {eventCompleted ? (
                <div className="mt-6 rounded-[2rem] border border-white/10 bg-black p-6">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Efter afslutning</p>
                  <h3 className="mt-3 text-2xl font-black">Tilføj vinder til Hall of Fame</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
                    Der findes ingen automatisk Hall of Fame-regel for dette flow endnu. Brug den kontrollerede Hall of Fame-side, når staff har godkendt den officielle vinder.
                  </p>
                  <Link href="/competition/hall-of-fame" className="mt-5 inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                    Tilføj vinder til Hall of Fame
                  </Link>
                </div>
              ) : null}
              {canUseDangerousActions ? (
                <div className="mt-8 rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6">
                  <h3 className="text-2xl font-black text-red-100">Permanent sletning</h3>
                  <p className="mt-3 text-sm text-red-100/75">Kun Super Admin. Historiske resultater og Hall of Fame beskytter eventet mod sletning.</p>
                  <form action={deleteAction} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input name="confirmation" placeholder={`Skriv: SLET ${event.title}`} className="rounded-2xl border border-red-500/30 bg-black px-4 py-3 text-white outline-none" />
                    <button className="rounded-full bg-red-500 px-6 py-3 font-black text-white" type="submit">Slet permanent</button>
                  </form>
                </div>
              ) : null}
            </section> : null}

            {currentTab === "media" ? <section id="medier" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <h2 className="text-3xl font-black">Billeder og visning</h2>
              <p className="mt-3 text-sm text-zinc-500">Upload, udskift eller fjern eventets permanente banner og thumbnail.</p>
              {savedState === "media" ? <p className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-black text-emerald-200">Billedændringerne er gemt.</p> : null}
              {!blobConfigured ? <div className="mt-5 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm text-yellow-100"><p className="font-black">Billedlager er ikke konfigureret endnu.</p><p className="mt-2 text-yellow-100/70">Forbind en Vercel Blob-store og gør BLOB_READ_WRITE_TOKEN tilgængelig i Development, Preview og Production efter behov.</p></div> : null}
              <form action={updateCompetitionEventImageAction.bind(null, event.id)} className="mt-7">
                <EventImageUpload eventId={event.id} initialUrl={event.bannerUrl ?? ""} configured={blobConfigured} initialFocusX={event.imageFocusX} initialFocusY={event.imageFocusY} />
                <button className="mt-4 rounded-full bg-white px-6 py-3 text-sm font-black text-black">Gem billede</button>
              </form>
              <div className="mt-7 grid gap-6 lg:grid-cols-3">
                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black">
                  <div className="relative aspect-[21/9] overflow-hidden bg-black"><EventImage src={event.bannerUrl} alt={event.imageAlt ?? event.title} variant="banner" /></div>
                  <div className="p-5"><p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Banner-preview</p><p className="mt-2 font-black">{event.title}</p></div>
                </div>
                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black">
                  <div className="relative aspect-video overflow-hidden bg-black"><EventImage src={event.thumbnailUrl ?? event.bannerUrl} alt={event.imageAlt ?? event.title} focusX={event.imageFocusX} focusY={event.imageFocusY} /></div>
                  <div className="p-5"><p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Eventkort-preview</p><p className="mt-2 text-sm text-zinc-500">16:9 cover · fokus {event.imageFocusX}% / {event.imageFocusY}%</p></div>
                </div>
                <div className="rounded-[2rem] border border-white/10 bg-black p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Offentlig visning</p>
                  <h3 className="mt-3 text-2xl font-black">Kontrollér eventkort og detaljeside</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">Begge visninger bruger EventImage og viser DarkLight-placeholder, hvis billedet mangler eller fejler.</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/upcoming" className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-zinc-200">Se eventoversigt</Link>
                    <Link href={`/events/${event.id}`} className="rounded-full bg-white px-5 py-3 text-sm font-black text-black">Se eventside</Link>
                    <Link href={commandCenterHref(event.id, "details")} className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-zinc-200">Udskift billede</Link>
                  </div>
                </div>
              </div>
            </section> : null}

            {currentTab === "prizes" ? <section id="præmier" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <h2 className="text-3xl font-black">Præmier</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                    Præmier vises på public event, dashboard og livecenter. Placering 1-3 kobles visuelt til resultater, mens specialpræmier kan tildeles manuelt.
                  </p>
                </div>
                <div className="grid gap-2 text-sm text-zinc-400 sm:grid-cols-3">
                  <span className="rounded-full border border-white/10 bg-black px-4 py-2">Aktive: {activePrizes.length}</span>
                  <span className="rounded-full border border-white/10 bg-black px-4 py-2">Kontant: {cashTotal > 0 ? formatPrizeCurrency(cashTotal, activePrizes.find((prize) => prize.amount)?.currency ?? "DKK") : "0"}</span>
                  <span className="rounded-full border border-white/10 bg-black px-4 py-2">Special: {specialPrizeCount}</span>
                </div>
              </div>

              {savedState === "prizes" || savedState === "winner" ? <p className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-black text-emerald-200">Præmieændringerne er gemt.</p> : null}

              <form method="get" className="mb-7 flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-black p-4 sm:flex-row sm:items-end">
                <input type="hidden" name="tab" value="prizes" />
                <label className="grid min-w-0 flex-1 gap-2 text-sm font-bold text-zinc-300">
                  Vis en anden numerisk placering
                  <input name="prizePlacement" type="number" min="1" defaultValue={requestedPrizePlacement ?? ""} className="min-w-0 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none" placeholder="Fx 7" />
                </label>
                <button className="rounded-full bg-white px-5 py-3 text-sm font-black text-black" type="submit">Vis placering</button>
              </form>

              <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
                {placementPrizeGroups.map((group) => (
                  <PlacementPrizeCard
                    key={group.key}
                    eventId={event.id}
                    label={group.label}
                    placement={group.placement}
                    prizes={group.prizes}
                    allPrizes={event.prizes}
                    winnerOptions={prizeWinnerOptions}
                  />
                ))}
                <PlacementPrizeCard
                  eventId={event.id}
                  label={specialPrizeGroup.label}
                  placement={null}
                  prizes={specialPrizeGroup.prizes}
                  allPrizes={event.prizes}
                  winnerOptions={prizeWinnerOptions}
                />
              </div>
            </section> : null}

            {currentTab === "participants" ? <section id="deltagere" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <h2 className="text-3xl font-black">Deltagerstyring</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                    Godkend, afvis og check deltagere ind direkte her. Kapacitet beregnes ud fra godkendte og tjekkede deltagere.
                  </p>
                </div>
                {pendingRegistrations > 0 ? (
                  <form action={approveAllPendingRegistrationsAction.bind(null, event.id)}>
                    <button className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300" type="submit">
                      Godkend alle afventende
                    </button>
                  </form>
                ) : null}
              </div>
              {savedState === "participants" || savedState === "note" ? <p className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-black text-emerald-200">Deltagerændringerne er gemt.</p> : null}
              <form method="get" className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-black p-4 md:grid-cols-[1fr_180px_180px_auto]">
                <input type="hidden" name="tab" value="participants" />
                <input name="q" defaultValue={participantQuery} placeholder="Søg navn, DarkLight ID eller note" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white" />
                <select name="status" defaultValue={participantStatus} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white">
                  <option value="ALL">Alle statusser</option><option value="PENDING">Afventer</option><option value="APPROVED">Godkendt</option><option value="REJECTED">Afvist</option><option value="CHECKED_IN">Checket ind</option><option value="MANUAL">Manuelt tilføjet</option><option value="CANCELLED">Fjernet</option>
                </select>
                <select name="sort" defaultValue={participantSort} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white">
                  <option value="date">Tilmeldingsdato</option><option value="name">Navn</option><option value="status">Status</option>
                </select>
                <button className="rounded-full bg-white px-5 py-3 text-sm font-black text-black">Filtrér</button>
                {event.usesVehicles ? <label className="flex items-center gap-3 text-sm text-zinc-400 md:col-span-4"><input type="checkbox" name="missingVehicle" value="1" defaultChecked={participantMissingVehicle} /> Kun deltagere uden valgt køretøj</label> : null}
              </form>
              <form id="participant-bulk-form" className="mb-6 flex flex-wrap gap-2">
                <button formAction={bulkUpdateRegistrationsAction.bind(null, event.id, "APPROVED")} className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-black">Massegodkend</button>
                <button formAction={bulkUpdateRegistrationsAction.bind(null, event.id, "REJECTED")} className="rounded-full border border-red-400/30 px-5 py-2.5 text-sm font-black text-red-200">Masseafvis</button>
                <button formAction={bulkUpdateRegistrationsAction.bind(null, event.id, "CHECKED_IN")} className="rounded-full border border-emerald-400/30 px-5 py-2.5 text-sm font-black text-emerald-200">Masse-check-in</button>
                <button formAction={bulkUpdateRegistrationsAction.bind(null, event.id, "CANCELLED")} className="rounded-full border border-red-500/30 px-5 py-2.5 text-sm font-black text-red-200">Fjern valgte</button>
                <label className="flex items-center gap-2 px-2 text-xs text-zinc-500"><input name="confirmBulkRemove" type="checkbox" /> Bekræft fjernelse</label>
              </form>
              <div className="mb-6 grid gap-3 md:grid-cols-6">
                <MiniStat label="Alle" value={event.registrations.length} />
                <MiniStat label="Afventer" value={pendingRegistrations} />
                <MiniStat label="Godkendte" value={event.registrations.filter((registration) => registration.status === "APPROVED").length} />
                <MiniStat label="Tjekket ind" value={checkedInRegistrations} />
                <MiniStat label="Afviste" value={rejectedRegistrations} />
                <MiniStat label="Ledige pladser" value={capacityRemaining} />
              </div>
              <div className="grid gap-4">
                {visibleRegistrations.map((registration) => {
                  const vehicleStatus = describeRegistrationVehicle(registration);
                  const linkedParticipant = event.competitions.flatMap((competition) => competition.participants).find((participant) => participant.userId === registration.userId);
                  const participantResults = linkedParticipant ? event.competitions.flatMap((competition) => competition.results).filter((result) => result.participantId === linkedParticipant.id) : [];
                  const participantPrizes = linkedParticipant ? event.prizes.flatMap((prize) => prize.winners).filter((winner) => winner.participantId === linkedParticipant.id) : [];
                  return (
                  <article key={registration.id} className="grid gap-4 rounded-2xl border border-white/10 bg-black p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="flex gap-4">
                      <input form="participant-bulk-form" name="registrationIds" value={registration.id} type="checkbox" aria-label={`Vælg ${registration.user.displayName}`} className="mt-2 size-4" />
                      <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-black">{registration.user.displayName}</h3>
                        <StatusBadge status={registration.status} />
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-zinc-400">
                          {registration.checkedInAt ? "Tjekket ind" : "Ikke tjekket ind"}
                        </span>
                        {requiresVehicles ? <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-zinc-400">{vehicleStatus}</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">
                        {registration.user.darklightId ?? registration.user.username} · {registration.vehicle?.displayName ?? "Køretøj ikke valgt"} · {registration.createdAt.toLocaleString("da-DK")}
                      </p>
                      {registration.internalNote ? <p className="mt-2 text-sm text-zinc-500">Note: {registration.internalNote}</p> : null}
                      <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <summary className="cursor-pointer text-sm font-black">Åbn deltagerdetaljer</summary>
                        <div className="mt-4 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
                          <p>Profil: {registration.user.displayName}</p><p>DarkLight ID: {registration.user.darklightId ?? "Ikke angivet"}</p>
                          <p>Status: {registration.status}</p><p>Tilmeldt: {registration.createdAt.toLocaleString("da-DK")}</p>
                          <p>Check-in: {registration.checkedInAt?.toLocaleString("da-DK") ?? "Ikke checket ind"}</p><p>Køretøj: {registration.vehicle?.displayName ?? "Ikke valgt"}</p>
                          <p>Resultater: {participantResults.length}</p><p>Tildelte præmier: {participantPrizes.length}</p>
                          <p>Audit: {eventActivity.filter((entry) => entry.target === `EventRegistration:${registration.id}`).length} registrerede handlinger</p>
                        </div>
                        <form action={updateParticipantNoteAction.bind(null, registration.id)} className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <input name="internalNote" defaultValue={registration.internalNote ?? ""} placeholder="Intern note" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white" />
                          <SmallButton>Gem note</SmallButton>
                        </form>
                      </details>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {registration.status === "PENDING" ? (
                        <>
                          <form action={updateRegistrationStatusAction.bind(null, registration.id, "APPROVED")}><SmallButton>Godkend</SmallButton></form>
                          <form action={updateRegistrationStatusAction.bind(null, registration.id, "REJECTED")}><SmallButton danger>Afvis</SmallButton></form>
                        </>
                      ) : null}
                      {registration.status === "APPROVED" ? (
                        <>
                          <form action={updateRegistrationStatusAction.bind(null, registration.id, "CHECKED_IN")}><SmallButton>Tjek ind</SmallButton></form>
                          <form action={updateRegistrationStatusAction.bind(null, registration.id, "CANCELLED")}><SmallButton danger>Afmeld</SmallButton></form>
                        </>
                      ) : null}
                      {registration.status === "CHECKED_IN" ? (
                        <form action={updateRegistrationStatusAction.bind(null, registration.id, "APPROVED")}><SmallButton>Fortryd check-in</SmallButton></form>
                      ) : null}
                      {registration.status === "REJECTED" ? (
                        <>
                          <form action={updateRegistrationStatusAction.bind(null, registration.id, "PENDING")}><SmallButton>Gendan til afventer</SmallButton></form>
                          <form action={updateRegistrationStatusAction.bind(null, registration.id, "CANCELLED")}><SmallButton danger>Fjern</SmallButton></form>
                        </>
                      ) : null}
                      <Link href={`/competition/drivers/${registration.userId}`} className="inline-flex min-w-24 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                        Åbn profil
                      </Link>
                      {registration.vehicleId ? (
                        <Link href={`/admin/vehicles/${registration.vehicleId}`} className="inline-flex min-w-24 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                          Åbn køretøj
                        </Link>
                      ) : null}
                    </div>
                  </article>
                  );
                })}
                {visibleManualParticipants.map((participant) => <article key={participant.id} className="grid gap-4 rounded-2xl border border-white/10 bg-black p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div><div className="flex flex-wrap gap-3"><h3 className="text-xl font-black">{participant.name}</h3><StatusBadge status="MANUAL" /></div><p className="mt-2 text-sm text-zinc-500">{participant.competitionTitle} · {participant.number ?? "Intet nummer"} · {participant.vehicle ?? "Intet køretøj"}</p></div>
                  <form action={removeParticipantAction.bind(null, participant.id)}><SmallButton danger>Fjern manuel deltager</SmallButton></form>
                </article>)}
                {visibleRegistrations.length === 0 && visibleManualParticipants.length === 0 ? <EmptyState text={event.registrations.length ? "Ingen deltagere matcher filtrene." : "Ingen tilmeldinger endnu. Del public eventlinket eller tilføj en deltager manuelt."} /> : null}
              </div>
              {event.competitions.length > 0 ? <div className="mt-8 rounded-[2rem] border border-white/10 bg-black p-6">
                <h3 className="text-xl font-black">Tilføj deltager manuelt</h3>
                {event.competitions.map((competition) => <form key={competition.id} action={addManualParticipantAction.bind(null, competition.id)} className="mt-4 grid gap-3 md:grid-cols-5">
                  <input name="name" placeholder="Deltagernavn" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white" />
                  <input name="vehicle" placeholder="Køretøj (valgfrit)" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white" />
                  <input name="number" placeholder="Nummer" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white" />
                  <input name="seed" type="number" placeholder="Seed" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white" />
                  <button className="rounded-full bg-white px-5 py-3 text-sm font-black text-black">Tilføj til {competition.title}</button>
                </form>)}
              </div> : null}
            </section> : null}

            {currentTab === "vehicles" ? <section id="køretøjer" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <h2 className="text-3xl font-black">Køretøjer på eventet</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                    Kun køretøjer valgt på dette event vises her. Brug VehicleOS-checklisten til detaljeret syn.
                  </p>
                </div>
                <Link href="/admin/vehicles" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                  Åbn VehicleOS
                </Link>
              </div>
              {savedState === "vehicles" ? <p className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-black text-emerald-200">Køretøjsændringerne er gemt.</p> : null}
              {event.requiresVehicleApproval && eventVehicles.length > 0 ? <form id="vehicle-bulk-form" className="mb-6 flex flex-wrap gap-2">
                <button formAction={bulkUpdateEventVehiclesAction.bind(null, event.id, "APPROVED")} className="rounded-full bg-white px-5 py-2.5 text-sm font-black text-black">Massegodkend valgte</button>
                <button formAction={bulkUpdateEventVehiclesAction.bind(null, event.id, "REJECTED")} className="rounded-full border border-red-400/30 px-5 py-2.5 text-sm font-black text-red-200">Masseafvis valgte</button>
              </form> : null}
              <div className="mb-6 grid gap-3 md:grid-cols-4">
                <MiniStat label="Valgte køretøjer" value={eventVehicles.length} />
                <MiniStat label="Godkendte" value={approvedVehicles} />
                <MiniStat label="Afventer syn" value={pendingVehicles} />
                <MiniStat label="Mangler valg" value={requiresVehicles ? missingVehicleAssignments : "Ikke påkrævet"} />
              </div>
              {requiresVehicles && missingVehicleAssignments > 0 ? (
                <div className="mb-6 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-5">
                  <p className="font-black text-yellow-100">Deltagere uden køretøj</p>
                  <p className="mt-2 text-sm leading-6 text-yellow-100/75">
                    {missingVehicleAssignments} godkendte deltagere mangler at vælge køretøj. Send dem til profilen/garage eller åbn deltagerfanen.
                  </p>
                  <Link href={`/competition/events/${event.id}?tab=participants#deltagere`} className="mt-4 inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-yellow-300/30 px-4 py-2 text-sm font-black text-yellow-100 transition hover:bg-yellow-300 hover:text-black">
                    Gå til deltagere
                  </Link>
                </div>
              ) : null}
              <div className="grid gap-4">
                {eventVehicles.map((registration) => {
                  const vehicle = registration.vehicle;
                  if (!vehicle) return null;
                  const latestInspection = vehicle.inspections[0];
                  const checklistApproved = latestInspection ? vehicle.inspections[0].items.filter((item) => item.result === "APPROVED").length : 0;
                  const checklistTotal = latestInspection?.items.length ?? 0;

                  return (
                    <article key={registration.id} className="grid gap-4 rounded-2xl border border-white/10 bg-black p-5 xl:grid-cols-[1fr_auto] xl:items-center">
                      <div className="flex gap-4">
                        {event.requiresVehicleApproval ? <input form="vehicle-bulk-form" name="registrationIds" value={registration.id} type="checkbox" aria-label={`Vælg ${vehicle.displayName}`} className="mt-2 size-4" /> : null}
                        <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-black">{vehicle.displayName}</h3>
                          <StatusBadge status={event.requiresVehicleApproval ? latestInspection?.status ?? "PENDING" : "SELECTED"} />
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-zinc-400">{vehicle.status}</span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                          {registration.user.displayName} · {vehicle.licensePlate ?? "Ingen plade"} · Klasse: {vehicle.vehicleClass ?? "Ikke angivet"} · Eventkategori: {vehicle.eventCategory ?? "Ikke angivet"}
                        </p>
                        <p className="mt-2 text-sm text-zinc-500">
                          Checklist: {checklistTotal > 0 ? `${checklistApproved}/${checklistTotal}` : "Der er endnu ikke oprettet en checklist til dette køretøj."}
                          {latestInspection?.notes ? ` · Note: ${latestInspection.notes}` : ""}
                        </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.requiresVehicleApproval ? <>
                          <form action={updateEventVehicleStatusAction.bind(null, registration.id, "APPROVED")}><SmallButton>Godkend</SmallButton></form>
                          <form action={updateEventVehicleStatusAction.bind(null, registration.id, "REJECTED")}><SmallButton danger>Afvis</SmallButton></form>
                          {latestInspection?.status === "APPROVED" || latestInspection?.status === "REJECTED" ? <form action={updateEventVehicleStatusAction.bind(null, registration.id, "PENDING")}><SmallButton>Fortryd afgørelse</SmallButton></form> : null}
                        </> : <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-200">Valgt / registreret</span>}
                        <Link href={`/admin/vehicles/${vehicle.id}`} className="inline-flex min-w-24 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                          Checklist
                        </Link>
                        <Link href={`/profile/vehicles/${vehicle.id}`} className="inline-flex min-w-24 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                          Se køretøj
                        </Link>
                        {latestInspection ? <details className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                          <summary className="cursor-pointer text-sm font-black">Rediger intern note</summary>
                          <form action={updateEventVehicleNoteAction.bind(null, registration.id)} className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <input name="internalNote" defaultValue={latestInspection.notes ?? ""} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black px-4 py-2 text-sm text-white" />
                            <SmallButton>Gem note</SmallButton>
                          </form>
                        </details> : null}
                      </div>
                    </article>
                  );
                })}
                {eventVehicles.length === 0 ? <EmptyState text="Ingen tilmeldte deltagere har valgt køretøj endnu. Godkend deltagere eller bed dem vælge køretøj før syn." href={`/competition/events/${event.id}?tab=participants#deltagere`} action="Gå til deltagere" /> : null}
              </div>
            </section> : null}

            {currentTab === "heats" ? <section id="køreliste" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <h2 className="mb-3 text-3xl font-black">Konkurrencer og kørelister</h2>
              <p className="mb-7 max-w-3xl text-sm leading-6 text-zinc-500">
                Kørelister laves ud fra godkendte deltagere i PostgreSQL. Hvis noget mangler, viser hvert konkurrencekort præcis hvad der blokerer.
              </p>
              {savedState === "heats" ? <p className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-black text-emerald-200">Kørelisten er opdateret.</p> : null}
              <div className="grid gap-6 xl:grid-cols-2">
                {event.competitions.map((competition) => {
                  const heatReadiness = describeHeatReadiness(competition, requiresVehicles, missingVehicleAssignments, pendingVehicles);
                  const assignedParticipantIds = new Set(competition.heats.flatMap((heat) => heat.entries.map((entry) => entry.participantId)));
                  const participantsMissingFromHeats = competition.participants.filter((participant) => !assignedParticipantIds.has(participant.id));
                  return (
                  <article key={competition.id} className="rounded-2xl border border-white/10 bg-black p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{competition.type}</p>
                    <h3 className="mt-3 text-2xl font-black">{competition.title}</h3>
                    <div className="mt-5 grid gap-3 md:grid-cols-4">
                      <MiniStat label="Deltagere" value={competition.participants.length} />
                      <MiniStat label="Resultater" value={competition.results.length} />
                      <MiniStat label="Heats" value={competition.heats.length} />
                      <MiniStat label="Brackets" value={competition.brackets.length} />
                    </div>
                    <div className={`mt-5 rounded-2xl border p-4 ${heatReadiness.ready ? "border-emerald-400/20 bg-emerald-400/10" : "border-yellow-300/20 bg-yellow-300/10"}`}>
                      <p className={`font-black ${heatReadiness.ready ? "text-emerald-100" : "text-yellow-100"}`}>{heatReadiness.title}</p>
                      <p className={`mt-2 text-sm leading-6 ${heatReadiness.ready ? "text-emerald-100/75" : "text-yellow-100/75"}`}>{heatReadiness.detail}</p>
                    </div>

                    <form action={addManualParticipantAction.bind(null, competition.id)} className="mt-5 grid gap-3 md:grid-cols-4">
                      <input name="name" placeholder="Deltagernavn" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none" />
                      <input name="vehicle" placeholder="Køretøj" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none" />
                      <input name="number" placeholder="Nummer" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none" />
                      <button className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-black text-black" type="submit">Tilføj</button>
                    </form>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <form action={generateHeatsAction.bind(null, competition.id)} className="flex gap-2">
                        <input name="participantsPerHeat" type="number" min="1" max="16" defaultValue="4" className="w-24 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none" />
                        <SmallButton>{competition.heats.length > 0 ? "Opdatér køreliste" : "Generér køreliste"}</SmallButton>
                      </form>
                      {competition.heats.some((heat) => heat.locked) ? <form action={unlockHeatsAction.bind(null, competition.id)}><SmallButton>Lås op</SmallButton></form> : <form action={lockHeatsAction.bind(null, competition.id)}><SmallButton>Lås heats</SmallButton></form>}
                      <Link href={`/competition/events/${event.id}?tab=bracket#bracket`} className="inline-flex min-w-24 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                        Gå til bracket
                      </Link>
                    </div>

                    <div className="mt-5 grid gap-4">
                      {competition.heats.map((heat) => (
                        <div key={heat.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-black">{heat.title}</p><StatusBadge status={heat.locked ? "LOCKED" : heat.status} /></div>
                          {!heat.locked ? <form action={deleteHeatAction.bind(null, heat.id)} className="mt-3"><SmallButton danger>Slet heat</SmallButton></form> : null}
                          <div className="mt-3 grid gap-2">
                            {heat.entries.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black p-3">
                              <span className="text-sm text-zinc-300">{entry.startPosition}. {entry.participant.name}</span>
                              {!heat.locked ? <span className="flex flex-wrap gap-2">
                                <form action={moveHeatEntryAction.bind(null, entry.id, "up")}><SmallButton>Op</SmallButton></form>
                                <form action={moveHeatEntryAction.bind(null, entry.id, "down")}><SmallButton>Ned</SmallButton></form>
                                {competition.heats.length > 1 ? <form action={moveHeatEntryToHeatAction.bind(null, entry.id)} className="flex gap-2">
                                  <select name="targetHeatId" defaultValue={heat.id} className="rounded-full border border-white/10 bg-black px-3 py-2 text-xs text-white">
                                    {competition.heats.map((targetHeat) => <option key={targetHeat.id} value={targetHeat.id}>{targetHeat.title}</option>)}
                                  </select><SmallButton>Flyt</SmallButton>
                                </form> : null}
                                <form action={removeHeatEntryAction.bind(null, entry.id)}><SmallButton danger>Fjern</SmallButton></form>
                              </span> : null}
                            </div>)}
                            {heat.entries.length === 0 ? <p className="text-sm text-zinc-500">Ingen deltagere</p> : null}
                          </div>
                        </div>
                      ))}
                      {competition.heats.length === 0 ? <EmptyState text={competition.participants.length < 2 ? "Der er ikke nok godkendte deltagere. Godkend deltagere før køreliste kan laves." : "Ingen køreliste endnu. Brug Lav køreliste for at generere heats."} href={competition.participants.length < 2 ? `/competition/events/${event.id}?tab=participants#deltagere` : undefined} action={competition.participants.length < 2 ? "Godkend deltagere" : undefined} /> : null}
                    </div>
                    {participantsMissingFromHeats.length > 0 && competition.heats.some((heat) => !heat.locked) ? <form action={addHeatEntryAction.bind(null, competition.id)} className="mt-5 grid gap-3 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 sm:grid-cols-[1fr_1fr_auto]">
                      <select name="participantId" className="rounded-2xl border border-yellow-300/20 bg-black px-4 py-3 text-sm text-white">{participantsMissingFromHeats.map((participant) => <option key={participant.id} value={participant.id}>{participant.name}</option>)}</select>
                      <select name="heatId" className="rounded-2xl border border-yellow-300/20 bg-black px-4 py-3 text-sm text-white">{competition.heats.filter((heat) => !heat.locked).map((heat) => <option key={heat.id} value={heat.id}>{heat.title}</option>)}</select>
                      <button className="rounded-full bg-yellow-200 px-5 py-3 text-sm font-black text-black">Tilføj til heat</button>
                    </form> : null}
                    {competition.heats.length > 0 ? <form action={resetHeatsAction.bind(null, competition.id)} className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                      <label className="flex items-center gap-3 text-sm text-red-100"><input name="confirmReset" type="checkbox" /> Jeg bekræfter reset af hele kørelisten</label>
                      <button className="mt-3 rounded-full border border-red-400/30 px-4 py-2 text-sm font-black text-red-200">Reset køreliste</button>
                    </form> : null}

                    <Link href={`/competition/events/${event.id}?tab=results#resultater`} className="mt-5 inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                      Indtast resultater
                    </Link>
                  </article>
                  );
                })}
                {event.competitions.length === 0 ? <EmptyState text="Ingen konkurrencer knyttet til eventet endnu." href={`/competition/events/${event.id}?tab=settings#indstillinger`} action="Gå til indstillinger" /> : null}
              </div>
            </section> : null}

            {currentTab === "bracket" ? <section id="bracket" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <h2 className="mb-3 text-3xl font-black">Bracket</h2>
              <p className="mb-7 max-w-3xl text-sm leading-6 text-zinc-500">
                Bracket bruges kun på relevante konkurrencetyper. Drift og Drag understøtter felter op til 32 deltagere med byes.
              </p>
              {savedState === "bracket" || savedState === "winner" ? <p className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-black text-emerald-200">Bracket er opdateret.</p> : null}
              <div className="grid gap-6 xl:grid-cols-2">
                {event.competitions.map((competition) => {
                  const bracketReadiness = describeBracketReadiness(competition);
                  return (
                  <article key={competition.id} className="rounded-2xl border border-white/10 bg-black p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{competition.type}</p>
                    <h3 className="mt-3 text-2xl font-black">{competition.title}</h3>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <MiniStat label="Deltagere" value={competition.participants.length} />
                      <MiniStat label="Bracket-størrelse" value={bracketReadiness.size} />
                      <MiniStat label="Status" value={competition.brackets.length ? "Genereret" : bracketReadiness.relevant ? "Mangler" : "Ikke relevant"} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                      {bracketReadiness.detail}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {bracketReadiness.relevant ? <form action={generateBracketAction.bind(null, competition.id)}><SmallButton>{competition.brackets.length > 0 ? "Regenerér bracket" : "Generér bracket"}</SmallButton></form> : null}
                      {competition.brackets.length > 0 ? competition.brackets.some((bracket) => bracket.locked)
                        ? <form action={setBracketLockAction.bind(null, competition.id, false)}><SmallButton>Lås bracket op</SmallButton></form>
                        : <form action={setBracketLockAction.bind(null, competition.id, true)}><SmallButton>Lås bracket</SmallButton></form> : null}
                      <Link href={`/competition/events/${event.id}?tab=results#resultater`} className="inline-flex min-w-24 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                        Indtast resultater
                      </Link>
                    </div>
                    <div className="mt-5 grid gap-4">
                      {competition.brackets.flatMap((bracket) => bracket.matches).map((match) => (
                        <div key={match.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <p className="font-black">Runde {match.round} · Kamp {match.matchNumber}</p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {match.participantA?.name ?? "BYE"} vs. {match.participantB?.name ?? "BYE"} · Vinder: {match.winner?.name ?? "Afventer"}
                          </p>
                          {match.participantA && match.participantB ? <div className="mt-3 flex flex-wrap gap-2">
                            <form action={selectMatchWinnerAction.bind(null, match.id, match.participantA.id)}><SmallButton>{match.winnerId === match.participantA.id ? "Valgt: " : "Vælg "}{match.participantA.name}</SmallButton></form>
                            <form action={selectMatchWinnerAction.bind(null, match.id, match.participantB.id)}><SmallButton>{match.winnerId === match.participantB.id ? "Valgt: " : "Vælg "}{match.participantB.name}</SmallButton></form>
                          </div> : null}
                        </div>
                      ))}
                      {competition.brackets.length === 0 ? <EmptyState text="Ingen bracket oprettet endnu. Klik Generér bracket, når deltagerne er klar." href={competition.participants.length < 2 ? `/competition/events/${event.id}?tab=participants#deltagere` : competition.heats.length === 0 ? `/competition/events/${event.id}?tab=heats#køreliste` : undefined} action={competition.participants.length < 2 ? "Godkend deltagere" : competition.heats.length === 0 ? "Lav køreliste" : undefined} /> : null}
                    </div>
                    {competition.brackets.length > 0 ? <form action={resetBracketAction.bind(null, competition.id)} className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                      <label className="flex items-center gap-3 text-sm text-red-100"><input name="confirmReset" type="checkbox" /> Jeg bekræfter reset af bracket og alle registrerede vindere</label>
                      <button className="mt-3 rounded-full border border-red-400/30 px-4 py-2 text-sm font-black text-red-200">Reset bracket</button>
                    </form> : null}
                  </article>
                  );
                })}
                {event.competitions.length === 0 ? <EmptyState text="Ingen konkurrencer knyttet til eventet endnu. Opret en konkurrence før bracket kan genereres." href={`/competition/events/${event.id}?tab=settings#indstillinger`} action="Gå til indstillinger" /> : null}
              </div>
            </section> : null}

            {currentTab === "results" ? <section id="resultater" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Event Center</p>
                  <h2 className="mt-3 text-4xl font-black">Resultater</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                    Indtast point, placeringer og tider direkte på dette event. Resultater gemmes i PostgreSQL og bruges af livevisning, rangliste og spillerstatistik.
                  </p>
                  <p className="mt-2 max-w-3xl text-sm font-bold text-zinc-300">Gemte resultater kan rettes direkte i felterne herunder. Brug “Gem ændringer” på den relevante deltager.</p>
                </div>
                <Link href="/competition/tablet" className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                  Åbn Event Tablet
                </Link>
              </div>

              {savedState === "results" ? (
                <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-sm font-bold text-emerald-100">
                  Resultater gemt.
                </div>
              ) : null}
              {savedState === "locked" || savedState === "unlocked" ? <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 text-sm font-bold text-emerald-100">Resultatlåsningen er opdateret.</div> : null}
              <form method="get" className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-black p-4 md:grid-cols-[1fr_220px_auto]">
                <input type="hidden" name="tab" value="results" />
                <input name="resultQ" defaultValue={resultQuery} placeholder="Søg deltager" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white" />
                <select name="resultFilter" defaultValue={resultFilter} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white"><option value="ALL">Alle deltagere</option><option value="MISSING">Mangler resultat</option><option value="COMPLETED">Færdige resultater</option><option value="DNF">DNF</option><option value="DNS">DNS</option><option value="INVALID">Ufuldstændige rækker</option></select>
                <button className="rounded-full bg-white px-5 py-3 text-sm font-black text-black">Filtrér</button>
              </form>

              <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MiniStat label="Godkendte eventdeltagere" value={approvedRegistrations} />
                <MiniStat label="Klar til resultater" value={totalResultParticipants} />
                <MiniStat label="Med resultat" value={totalResults} />
                <MiniStat label="Mangler resultat" value={missingResults} />
              </div>
              <div className="mb-6 rounded-2xl border border-white/10 bg-black p-5 text-sm leading-6 text-zinc-500">
                <p><span className="font-black text-zinc-300">DNF</span> betyder gennemførte ikke. <span className="font-black text-zinc-300">DNS</span> betyder startede ikke. Diskvalificeret bruges kun, når staff aktivt har afgjort det.</p>
                {activePrizes.length > 0 ? (
                  <Link href={`/competition/events/${event.id}?tab=prizes#præmier`} className="mt-3 inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                    Se og tildel specialpræmier
                  </Link>
                ) : null}
              </div>

              {event.competitions.length === 0 ? (
                <EmptyState text="Der er endnu ingen godkendte deltagere, som kan få registreret resultater." />
              ) : (
                <div className="grid gap-6">
                  {event.competitions.map((competition) => (
                    <ResultEntryPanel key={competition.id} competition={competition} prizes={activePrizes} role={currentUser.role} query={resultQuery} filter={resultFilter} />
                  ))}
                </div>
              )}
            </section> : null}

            {currentTab === "live" ? <section id="live" className="mt-8 scroll-mt-8 grid gap-8 xl:grid-cols-2">
              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
                <h2 className="mb-7 text-3xl font-black">Livebeskeder</h2>
                <form action={announcementAction} className="grid gap-3">
                  <input name="title" placeholder="Titel" className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none" />
                  <textarea name="message" placeholder="Besked" rows={4} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none" />
                  <label className="flex items-center gap-3 text-sm font-bold text-zinc-300"><input type="checkbox" name="publish" defaultChecked /> Publicér nu</label>
                  <button className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 font-black text-black" type="submit">Tilføj besked</button>
                </form>
              </div>

              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
                <h2 className="text-3xl font-black">Eventaktivitet</h2>
                <p className="mt-4 text-sm leading-6 text-zinc-500">Livebeskeder og øvrige ændringer registreres i eventets audit-log.</p>
                <Link href={commandCenterHref(event.id, "overview")} className="mt-5 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200">
                  Se seneste aktivitet
                </Link>
              </div>
            </section> : null}

            {currentTab === "tablet" ? <section id="tablet" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Event Tablet</p>
              <h2 className="mt-3 text-4xl font-black">Touch-flow til eventdagen</h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400">
                Tabletfladen samler check-in, resultater og livehandlinger med større knapper. Brug den på eventdagen, når opsætningen er klar.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <MiniStat label="Tilmeldinger" value={event.registrations.length} />
                <MiniStat label="Tjekket ind" value={event.registrations.filter((registration) => registration.status === "CHECKED_IN").length} />
                <MiniStat label="Resultater" value={event.competitions.reduce((total, competition) => total + competition.results.length, 0)} />
              </div>
              <Link href="/competition/tablet" className="mt-6 inline-flex items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
                Åbn Event Tablet
              </Link>
            </section> : null}
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </main>
  );
}

type PrizeAdminItem = {
  id: string;
  title: string;
  description: string | null;
  prizeType: string;
  placement: number | null;
  amount: { toString(): string } | string | number | null;
  currency: string | null;
  itemName: string | null;
  sponsorName: string | null;
  awardLabel: string | null;
  sortOrder: number;
  createdAt: Date;
  active: boolean;
  winners: Array<{
    id: string;
    participant: { id: string; name: string; userId: string | null } | null;
    user: { id: string; displayName: string; darklightId: string | null } | null;
    note: string | null;
  }>;
};

type PrizeWinnerOption = {
  id: string;
  name: string;
  userId: string | null;
  competitionTitle: string;
};

function PlacementPrizeCard({
  eventId,
  label,
  placement,
  prizes,
  allPrizes,
  winnerOptions,
}: {
  eventId: string;
  label: string;
  placement: number | null;
  prizes: PrizeAdminItem[];
  allPrizes: PrizeAdminItem[];
  winnerOptions: PrizeWinnerOption[];
}) {
  const isSpecial = placement === null;
  const atLimit = !isSpecial && prizes.length >= MAX_PRIZE_PARTS_PER_PLACEMENT;

  return (
    <article className="min-w-0 rounded-[2rem] border border-white/10 bg-black p-5 sm:p-6">
      <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-black uppercase tracking-[0.16em] text-white">{label}</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {isSpecial ? `${prizes.length} særpræmier` : `${prizes.length}/${MAX_PRIZE_PARTS_PER_PLACEMENT} præmiedele`}
          </p>
        </div>
        {atLimit ? (
          <button type="button" disabled className="cursor-not-allowed rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-600">
            Tilføj præmiedel
          </button>
        ) : null}
      </div>

      {prizes.length > 0 ? (
        <div className="grid min-w-0 gap-4">
          {prizes.map((prize) => {
            const globalIndex = allPrizes.findIndex((item) => item.id === prize.id);
            return <PrizeAdminCard key={prize.id} prize={prize} index={globalIndex} total={allPrizes.length} winnerOptions={winnerOptions} />;
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-zinc-500">Ingen præmiedele oprettet endnu.</div>
      )}

      {atLimit ? (
        <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm font-bold text-amber-100">
          Denne placering har allerede det maksimale antal på 5 præmiedele.
        </p>
      ) : (
        <details className="mt-4 min-w-0 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <summary className="cursor-pointer text-sm font-black text-white">+ Tilføj præmiedel</summary>
          <EventPrizeForm
            action={createEventPrizeAction.bind(null, eventId)}
            submitLabel="Gem præmiedel"
            fixedPlacement={placement}
            placementLocked
          />
        </details>
      )}
    </article>
  );
}

function PrizeAdminCard({ prize, index, total, winnerOptions }: { prize: PrizeAdminItem; index: number; total: number; winnerOptions: PrizeWinnerOption[] }) {
  const updateAction = updateEventPrizeAction.bind(null, prize.id);
  const deactivateAction = deactivateEventPrizeAction.bind(null, prize.id);
  const moveUpAction = moveEventPrizeAction.bind(null, prize.id, "up");
  const moveDownAction = moveEventPrizeAction.bind(null, prize.id, "down");
  const assignWinnerAction = assignEventPrizeWinnerAction.bind(null, prize.id);

  return (
    <article className={`min-w-0 overflow-hidden rounded-[2rem] border p-5 sm:p-6 ${prize.active ? "border-white/10 bg-black" : "border-white/5 bg-white/[0.02] opacity-70"}`}>
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-zinc-300">{prizeTypeLabel(prize.prizeType)}</span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-zinc-300">{prizePlacementLabel(prize)}</span>
            {!prize.active ? <span className="rounded-full border border-red-400/20 px-3 py-1 text-xs font-black text-red-200">Inaktiv</span> : null}
          </div>
          <h3 className="mt-3 text-2xl font-black">{prize.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{prizeSummary(prize)}</p>
          {prize.winners.length > 0 ? <div className="mt-3 grid gap-2">{prize.winners.map((winner) => <div key={winner.id} className="flex flex-wrap items-center gap-2 text-sm font-bold text-emerald-200"><span>{winner.participant?.name ?? winner.user?.displayName ?? "Ukendt"}</span><form action={unassignEventPrizeWinnerAction.bind(null, winner.id)}><SmallButton danger>Fjern tildeling</SmallButton></form></div>)}</div> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={moveUpAction}><SmallButton>Flyt op</SmallButton></form>
          <form action={moveDownAction}><SmallButton>Flyt ned</SmallButton></form>
          {prize.active ? <form action={deactivateAction}><SmallButton>Skjul</SmallButton></form> : <form action={toggleEventPrizeVisibilityAction.bind(null, prize.id, true)}><SmallButton>Aktivér</SmallButton></form>}
        </div>
      </div>

      <details className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <summary className="cursor-pointer font-black">Rediger præmie</summary>
        <EventPrizeForm action={updateAction} submitLabel="Gem præmie" prize={serializeEventPrizeForClient(prize)} />
      </details>

      <form action={assignWinnerAction} className="mt-4 grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <label className="grid min-w-0 gap-2 text-sm font-bold text-zinc-300">
          Manuel vinder
          <select name="participantId" className="min-w-0 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none" defaultValue="">
            <option value="">Vælg deltager</option>
            {winnerOptions.map((participant) => (
              <option key={`${prize.id}-${participant.id}`} value={participant.id}>
                {participant.name} · {participant.competitionTitle}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold text-zinc-300">
          Note
          <input name="note" className="min-w-0 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none" placeholder="Valgfrit" />
        </label>
        <button className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300" type="submit">
          Tildel
        </button>
      </form>
      <form action={deleteEventPrizeAction.bind(null, prize.id)} className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
        <label className="flex items-center gap-2 text-sm text-red-100"><input name="confirmDelete" type="checkbox" /> Bekræft permanent sletning</label>
        <SmallButton danger>Slet præmie</SmallButton>
      </form>
      <p className="mt-3 text-xs text-zinc-600">Rækkefølge: {index + 1} af {total}. Raw sortOrder vises ikke.</p>
    </article>
  );
}

function prizeTypeLabel(type: string) {
  const labels: Record<string, string> = {
    CASH: "Kontant",
    VEHICLE: "Køretøj",
    TROPHY: "Trofæ",
    SPONSOR: "Sponsor",
    VIP: "VIP",
    ITEM: "Item",
    SPECIAL: "Special",
    OTHER: "Andet",
  };
  return labels[type] ?? type;
}

function prizePlacementLabel(prize: Pick<PrizeAdminItem, "placement" | "awardLabel">) {
  if (prize.placement === 1) return "1. plads";
  if (prize.placement === 2) return "2. plads";
  if (prize.placement === 3) return "3. plads";
  if (prize.placement) return `${prize.placement}. plads`;
  return prize.awardLabel ?? "Special award";
}

function prizeSummary(prize: Pick<PrizeAdminItem, "amount" | "currency" | "itemName" | "sponsorName" | "description">) {
  const parts = [
    prize.amount ? formatPrizeCurrency(Number(prize.amount), prize.currency ?? "DKK") : null,
    prize.itemName,
    prize.sponsorName ? `Sponsor: ${prize.sponsorName}` : null,
    prize.description,
  ].filter(Boolean);
  return parts.join(" · ") || "Ingen ekstra detaljer.";
}

function commandCenterStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Kladde",
    PUBLISHED: "Publiceret",
    REGISTRATION_OPEN: "Tilmelding åben",
    REGISTRATION_CLOSED: "Tilmelding lukket",
    UPCOMING: "Kommende",
    ACTIVE: "I gang",
    COMPLETED: "Afsluttet",
    CANCELLED: "Aflyst",
    ARCHIVED: "Arkiveret",
  };
  return labels[status] ?? "Ukendt status";
}

function activeFeatureLabels(features: EventFeatures) {
  return [
    features.usesParticipantRegistration ? "Deltagertilmelding" : null,
    features.usesVehicles ? "Køretøjer" : null,
    features.requiresVehicleApproval ? "Køretøjsgodkendelse" : null,
    features.usesHeats ? "Køreliste / heats" : null,
    features.usesBracket ? "Bracket" : null,
    features.usesResults ? "Resultater" : null,
    features.usesPrizes ? "Præmier" : null,
  ].filter((label): label is string => Boolean(label));
}

function auditActionLabel(action: string) {
  return action
    .replaceAll("_", " ")
    .toLocaleLowerCase("da-DK")
    .replace(/^./, (letter) => letter.toLocaleUpperCase("da-DK"));
}

function Field({ label, name, defaultValue, type = "text" }: { label: string; name: string; defaultValue: string; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-zinc-300">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none" />
    </label>
  );
}

type EventCenterCompetition = {
  id: string;
  title: string;
  type: string;
  participants: Array<{
    id: string;
    name: string;
    number: string | null;
    vehicle: string | null;
    status: string;
  }>;
  results: Array<{
    participantId: string;
    placement: number;
    points: number | null;
    status: string;
    finishTimeMs: number | null;
    reactionTimeMs: number | null;
    notes: string | null;
    locked: boolean;
  }>;
};

function ResultEntryPanel({ competition, prizes, role, query, filter }: { competition: EventCenterCompetition; prizes: PrizeAdminItem[]; role: string; query: string; filter: string }) {
  const resultsByParticipant = new Map(competition.results.map((result) => [result.participantId, result]));
  const prizesByPlacement = new Map<number, PrizeAdminItem[]>();
  prizes.forEach((prize) => {
    if (!prize.placement || !prize.active) return;
    prizesByPlacement.set(prize.placement, [...(prizesByPlacement.get(prize.placement) ?? []), prize]);
  });
  const lockAction = lockCompetitionResultsAction.bind(null, competition.id);
  const saveAllAction = saveAllResultsAction.bind(null, competition.id);
  const resultsLocked = competition.results.length > 0 && competition.results.every((result) => result.locked);
  const hasLockedResults = competition.results.some((result) => result.locked);
  const eligibleParticipants = competition.participants.filter((participant) => participant.status === "APPROVED" || participant.status === "CHECKED_IN");
  const visibleParticipants = eligibleParticipants.filter((participant) => {
    const result = resultsByParticipant.get(participant.id);
    if (query && !participant.name.toLocaleLowerCase("da-DK").includes(query.toLocaleLowerCase("da-DK"))) return false;
    if (filter === "MISSING") return !result;
    if (filter === "COMPLETED") return Boolean(result);
    if (filter === "DNF" || filter === "DNS") return result?.status === filter;
    if (filter === "INVALID") return !result || (result.status === "APPROVED" && result.placement < 1);
    return true;
  });

  return (
    <article className="rounded-[2rem] border border-white/10 bg-black p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{competition.type}</p>
          <h3 className="mt-3 text-3xl font-black">{competition.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{resultHelpText(competition.type)}</p>
        </div>
        <div className="flex flex-wrap gap-2"><StatusBadge status={resultsLocked ? "LOCKED" : competition.results.length === eligibleParticipants.length && competition.results.length > 0 ? "READY" : "DRAFT"} /><form action={lockAction}>
          <button
            disabled={competition.results.length === 0 || competition.results.every((result) => result.locked)}
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            type="submit"
          >
            Lås resultater
          </button>
        </form>{resultsLocked && (role === "SUPER_ADMIN" || role === "ADMIN") ? <form action={unlockCompetitionResultsAction.bind(null, competition.id)} className="flex items-center gap-2"><label className="text-xs text-zinc-400"><input name="confirmUnlock" type="checkbox" /> Bekræft oplåsning</label><SmallButton>Lås op</SmallButton></form> : null}</div>
      </div>

      {eligibleParticipants.length === 0 ? (
        <EmptyState text="Der er endnu ingen deltagere klar til resultatindtastning. Godkend tilmeldinger eller tilføj deltagere først." />
      ) : (
        <form action={saveAllAction} className="grid gap-4">
          <input type="hidden" name="competitionId" value={competition.id} />
          {visibleParticipants.map((participant) => {
            const result = resultsByParticipant.get(participant.id);
            const placementPrizes = result?.placement ? prizesByPlacement.get(result.placement) ?? [] : [];
            const saveOneAction = saveResultAction.bind(null, competition.id, participant.id);
            const rowLocked = Boolean(result?.locked);
            const prizeMismatch = result ? hasPrizePlacementMismatch({ participantId: participant.id, placement: result.placement }, prizes) : false;
            return (
              <div key={participant.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <input type="hidden" name="participantId" value={participant.id} />
                <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                  <div>
                    <h4 className="text-xl font-black">{participant.name}</h4>
                    <p className="mt-1 text-sm text-zinc-500">
                      {participant.number ? `Startnummer ${participant.number}` : "Startnummer ikke sat"} · {participant.vehicle ?? "Køretøj ikke valgt"}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-xs font-black text-zinc-300">
                    {result ? resultLabel(result.status, result.locked) : "Ikke gemt"}
                  </span>
                </div>
                {placementPrizes.length > 0 ? (
                  <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-100/70">Præmie ved placering {result?.placement}</p>
                    <p className="mt-2 text-sm font-bold text-emerald-100">{placementPrizes.map((prize) => `${prize.title} (${prizeSummary(prize)})`).join(" · ")}</p>
                  </div>
                ) : null}
                {prizeMismatch ? <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-bold text-amber-100">Placeringen matcher ikke længere en manuelt tildelt placeringspræmie. Tildelingen er bevaret og skal gennemgås under Præmier.</div> : null}

                <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-7">
                  <ResultInput label="Placering" name="placement" defaultValue={result && result.status !== "DNF" && result.status !== "DNS" && result.placement > 0 ? result.placement : null} disabled={rowLocked} />
                  <ResultInput label="Tid" name="finishTimeMs" defaultValue={formatResultTime(result?.finishTimeMs)} text placeholder="MM:SS.fff" disabled={rowLocked} />
                  <ResultInput label="Point" name="points" defaultValue={result?.points} disabled={rowLocked} />
                  {competition.type === "DRAG" ? <ResultInput label="Reaktionstid (ms)" name="reactionTimeMs" defaultValue={result?.reactionTimeMs} disabled={rowLocked} /> : <input type="hidden" name="reactionTimeMs" value={result?.reactionTimeMs ?? ""} />}
                  <ResultInput label="Noter" name="notes" defaultValue={result?.notes ?? ""} text disabled={rowLocked} />
                  <label className="grid min-w-0 gap-2 text-sm font-bold text-zinc-300">
                    Status
                    <select name="status" disabled={rowLocked} defaultValue={result?.status ?? "APPROVED"} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none disabled:opacity-50">
                      <option value="APPROVED">Godkendt</option>
                      <option value="DNF">DNF</option>
                      <option value="DNS">DNS</option>
                      <option value="DISQUALIFIED">Diskvalificeret</option>
                      <option value="PENDING">Afventer</option>
                    </select>
                  </label>
                  <button
                    disabled={rowLocked}
                    className="inline-flex shrink-0 items-center justify-center self-end whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300"
                    formAction={saveOneAction}
                    type="submit"
                  >
                    {result ? "Gem ændringer" : "Gem resultat"}
                  </button>
                </div>
              </div>
            );
          })}
          {visibleParticipants.length === 0 ? <EmptyState text="Ingen deltagere matcher resultatfilteret." /> : null}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-white">Gem alle resultater</p>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Validerer alle rækker og gemmer dem samlet. Hvis én række fejler, gemmes ingen delvise resultater.
              </p>
            </div>
            <button disabled={hasLockedResults} className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-zinc-300 disabled:opacity-40" type="submit">
              Gem alle resultater
            </button>
          </div>
        </form>
      )}
    </article>
  );
}

function ResultInput({ label, name, defaultValue, text = false, disabled = false, placeholder }: { label: string; name: string; defaultValue?: string | number | null; text?: boolean; disabled?: boolean; placeholder?: string }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-bold text-zinc-300">
      {label}
      <input
        name={name}
        type={text ? "text" : "number"}
        min={text ? undefined : "0"}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none disabled:opacity-50"
      />
    </label>
  );
}

function resultHelpText(type: string) {
  if (type === "RACE") return "Race viser tid, placering, point og DNF/DNS/diskvalifikation.";
  if (type === "DRAG") return "Drag viser reaktionstid, sluttid, placering/vinder og status.";
  if (type === "DRIFT") return "Drift viser point, placering og status.";
  if (type === "CAR_SHOW") return "Car Show viser kategori/noter, point og placering.";
  return "Indtast tid, point, placering eller en kombination, som passer til konkurrencen.";
}

function resultLabel(status: string, locked: boolean) {
  const labels: Record<string, string> = {
    APPROVED: "Godkendt",
    PENDING: "Afventer",
    REJECTED: "Afvist",
    DNF: "DNF",
    DNS: "DNS",
    DISQUALIFIED: "Diskvalificeret",
  };
  return `${labels[status] ?? status}${locked ? " · låst" : ""}`;
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}

type WorkflowStep = {
  label: string;
  done: boolean;
  href: string;
  detail: string;
  action: string;
};

function WorkflowStepLink({
  eventId,
  index,
  step,
  state,
}: {
  eventId: string;
  index: number;
  step: WorkflowStep;
  state: "completed" | "current" | "blocked";
}) {
  const stateClass = state === "completed"
    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
    : state === "current"
      ? "border-yellow-300/30 bg-yellow-300/10 text-yellow-100"
      : "border-white/10 bg-black text-zinc-400";
  const dotClass = state === "completed"
    ? "bg-emerald-400 text-black"
    : state === "current"
      ? "bg-yellow-300 text-black"
      : "bg-white/10 text-zinc-500";

  return (
    <Link href={`/competition/events/${eventId}?tab=${step.href}${tabHash(step.href)}`} className={`rounded-2xl border p-4 transition hover:border-white/30 ${stateClass}`}>
      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${dotClass}`}>
        {state === "completed" ? "✓" : index + 1}
      </span>
      <span className="mt-3 block text-sm font-black">{step.label}</span>
      <span className="mt-1 block text-xs leading-5 opacity-75">{step.detail}</span>
    </Link>
  );
}

function describeRegistrationVehicle(registration: {
  vehicle: {
    status: string;
    inspections: Array<{ status: string }>;
  } | null;
}) {
  if (!registration.vehicle) return "Køretøj mangler";
  const latestInspection = registration.vehicle.inspections[0];
  if (registration.vehicle.status !== "ACTIVE") return "Køretøj ikke aktivt";
  if (!latestInspection) return "Syn mangler";
  if (latestInspection.status === "APPROVED") return "Køretøj godkendt";
  if (latestInspection.status === "REJECTED") return "Køretøj afvist";
  return "Syn afventer";
}

function describeHeatReadiness(
  competition: { type: string; participants: Array<unknown>; heats: Array<unknown>; results: Array<unknown> },
  requiresVehicles: boolean,
  missingVehicleAssignments: number,
  pendingVehicles: number,
) {
  if (!["DRIFT", "DRAG", "RACE"].includes(competition.type)) {
    return { ready: true, title: "Køreliste er valgfri", detail: "Denne konkurrence kræver ikke heat-inddeling i standardflowet." };
  }
  if (competition.results.length > 0) {
    return { ready: true, title: "Resultater findes", detail: "Der er allerede gemt resultater, så køreliste bør ikke regenereres uden korrektionsflow." };
  }
  if (competition.participants.length < 2) {
    return { ready: false, title: "Der mangler godkendte deltagere", detail: "Godkend mindst to deltagere, før køreliste kan laves." };
  }
  if (requiresVehicles && missingVehicleAssignments > 0) {
    return { ready: false, title: "Der mangler køretøjer", detail: `${missingVehicleAssignments} godkendte deltagere mangler stadig at vælge køretøj.` };
  }
  if (requiresVehicles && pendingVehicles > 0) {
    return { ready: false, title: "Køretøjer afventer syn", detail: `${pendingVehicles} køretøjer kræver handling, før flowet er helt klart.` };
  }
  if (competition.heats.length > 0) {
    return { ready: true, title: "Køreliste er genereret", detail: "Heats ligger gemt i databasen og bevares efter refresh." };
  }
  return { ready: true, title: "Klar til køreliste", detail: "Deltagerne er klar. Brug Generér køreliste for at lave heat-inddelingen." };
}

function describeBracketReadiness(competition: { type: string; participants: Array<unknown>; heats: Array<unknown>; brackets: Array<{ size: number }> }) {
  const relevant = ["DRIFT", "DRAG"].includes(competition.type);
  if (!relevant) {
    return { relevant, size: "Ikke relevant", detail: "Denne konkurrence bruger ikke bracket i standardflowet." };
  }
  if (competition.participants.length < 2) {
    return { relevant, size: "Mangler", detail: "Der skal mindst være to deltagere for at generere bracket." };
  }
  const size = competition.brackets[0]?.size ?? nextBracketSize(competition.participants.length);
  if (competition.heats.length === 0) {
    return { relevant, size, detail: "Lav køreliste først, hvis bracket skal følge heat/seed-flowet." };
  }
  return { relevant, size, detail: competition.brackets.length > 0 ? "Bracket er genereret og gemt i PostgreSQL." : "Bracket kan genereres nu. Byes oprettes automatisk ved skævt deltagerantal." };
}

function nextBracketSize(count: number) {
  if (count > 16) return 32;
  if (count > 8) return 16;
  if (count > 4) return 8;
  if (count > 2) return 4;
  return 2;
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    PENDING: "Afventer godkendelse",
    APPROVED: "Godkendt",
    REJECTED: "Afvist",
    CANCELLED: "Fjernet",
    CHECKED_IN: "Tjekket ind",
    MANUAL: "Manuelt tilføjet",
    SELECTED: "Valgt / registreret",
    DRAFT: "Kladde",
    READY: "Klar",
    LOCKED: "Låst",
    ACTIVE: "I gang",
    COMPLETED: "Afsluttet",
  };
  return <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-zinc-300">{labels[status] ?? status}</span>;
}

function SmallButton({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      type="submit"
      className={`inline-flex min-w-24 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition ${danger ? "border border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white" : "border border-white/10 text-zinc-200 hover:bg-white hover:text-black"}`}
    >
      {children}
    </button>
  );
}

function EmptyState({ text, href, action }: { text: string; href?: string; action?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-5">
      <p className="text-sm leading-6 text-zinc-500">{text}</p>
      {href && action ? (
        <Link href={href} className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
          {action}
        </Link>
      ) : null}
    </div>
  );
}
