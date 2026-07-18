import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";
import {
  archiveCompetitionEventAction,
  deleteCompetitionEventAction,
  updateCompetitionEventAction,
} from "@/app/competition/events/actions";
import {
  addManualParticipantAction,
  completeEventAction,
  createAnnouncementAction,
  generateBracketAction,
  generateHeatsAction,
  lockCompetitionResultsAction,
  lockHeatsAction,
  saveAllResultsAction,
  saveResultAction,
  updateEventVehicleStatusAction,
  updateRegistrationStatusAction,
} from "@/app/competition/eventos-actions";

export const dynamic = "force-dynamic";

function toInputDate(value: Date | null) {
  if (!value) return "";
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

type EventDetailsSearchParams = {
  tab?: string | string[];
  saved?: string | string[];
};

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function tabHash(tab: string) {
  if (tab === "overview") return "#oversigt";
  if (tab === "participants") return "#deltagere";
  if (tab === "vehicles") return "#køretøjer";
  if (tab === "heats") return "#køreliste";
  if (tab === "bracket") return "#bracket";
  if (tab === "results") return "#resultater";
  if (tab === "live") return "#live";
  if (tab === "tablet") return "#tablet";
  if (tab === "settings") return "#indstillinger";
  return "#oversigt";
}

const eventTabs = [
  ["Oversigt", "overview", "#oversigt"],
  ["Deltagere", "participants", "#deltagere"],
  ["Køretøjer", "vehicles", "#køretøjer"],
  ["Køreliste", "heats", "#køreliste"],
  ["Bracket", "bracket", "#bracket"],
  ["Resultater", "results", "#resultater"],
  ["Live", "live", "#live"],
  ["Tablet", "tablet", "#tablet"],
  ["Indstillinger", "settings", "#indstillinger"],
] as const;

export default async function EventDetailsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<EventDetailsSearchParams> }) {
  const { id } = await params;
  const query = await searchParams;
  const activeTab = readParam(query.tab) || "overview";
  const savedState = readParam(query.saved);
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
      announcements: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: [{ priority: "desc" }, { createdAt: "desc" }] },
      _count: { select: { gallery: true } },
    },
  });

  if (!event) {
    notFound();
  }

  const currentTab = eventTabs.some(([, tab]) => tab === activeTab) ? activeTab : "overview";
  const updateAction = updateCompetitionEventAction.bind(null, event.id);
  const archiveAction = archiveCompetitionEventAction.bind(null, event.id);
  const deleteAction = deleteCompetitionEventAction.bind(null, event.id);
  const announcementAction = createAnnouncementAction.bind(null, event.id);
  const completeAction = completeEventAction.bind(null, event.id);
  const approvedRegistrations = event.registrations.filter((registration) => registration.status === "APPROVED" || registration.status === "CHECKED_IN").length;
  const pendingRegistrations = event.registrations.filter((registration) => registration.status === "PENDING").length;
  const eventVehicles = event.registrations.filter((registration) => registration.vehicle);
  const pendingVehicles = eventVehicles.filter((registration) => {
    const latestInspection = registration.vehicle?.inspections[0];
    return registration.vehicle?.status !== "ACTIVE" || !latestInspection || latestInspection.status === "PENDING" || latestInspection.status === "IN_PROGRESS";
  }).length;
  const heatsGenerated = event.competitions.length > 0 && event.competitions.every((competition) => competition.heats.length > 0);
  const bracketsGenerated = event.competitions.length > 0 && event.competitions.every((competition) => competition.brackets.length > 0);
  const resultsEntered = event.competitions.length > 0 && event.competitions.every((competition) => competition.participants.length > 0 && competition.results.length > 0);
  const eventCompleted = event.status === "COMPLETED" || event.status === "ARCHIVED";
  const eventCanComplete = resultsEntered && !eventCompleted;
  const resultReady = event.competitions.some((competition) => competition.participants.length > 0);
  const resultSetupMessage = event.competitions.length === 0
    ? "Opret en konkurrence på eventet, før resultater kan indtastes."
    : approvedRegistrations === 0
      ? "Godkend eller tjek deltagere ind, før resultater kan indtastes."
      : "Køreliste kan oprettes først, men du kan også gemme resultater direkte på godkendte deltagere.";
  const workflowSteps = [
    { label: "Event oprettet", done: true, href: "overview", detail: "Basisdata findes" },
    { label: "Tilmelding åben", done: event.status === "REGISTRATION_OPEN" || event.status === "ACTIVE" || event.status === "COMPLETED", href: "settings", detail: event.status },
    { label: "Godkend deltagere", done: pendingRegistrations === 0 && approvedRegistrations > 0, href: "participants", detail: pendingRegistrations ? `${pendingRegistrations} afventer` : `${approvedRegistrations} godkendte` },
    { label: "Godkend køretøjer", done: pendingVehicles === 0 && eventVehicles.length > 0, href: "vehicles", detail: eventVehicles.length ? `${pendingVehicles} kræver handling` : "Ingen valgte køretøjer" },
    { label: "Lav køreliste", done: heatsGenerated, href: "heats", detail: heatsGenerated ? "Klar" : "Mangler" },
    { label: "Generér bracket", done: bracketsGenerated, href: "bracket", detail: bracketsGenerated ? "Klar" : "Mangler" },
    { label: "Indtast resultater", done: resultsEntered, href: "results", detail: resultsEntered ? "Gemte" : resultSetupMessage },
    { label: "Afslut event", done: eventCompleted, href: "settings", detail: eventCompleted ? event.status : eventCanComplete ? "Klar til afslutning" : "Kræver resultater" },
  ];
  const nextStep = workflowSteps.find((step) => !step.done) ?? workflowSteps[workflowSteps.length - 1];

  return (
    <main className="min-h-screen bg-black text-white">
      <CompetitionLayout>
        <section className="relative overflow-hidden px-6 py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative mx-auto max-w-[1500px]">
            <Link href="/competition/events" className="mb-10 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-300 transition hover:bg-white hover:text-black">
              Tilbage til events
            </Link>

            <nav aria-label="Event Center sektioner" className="mb-8 flex gap-2 overflow-x-auto rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {eventTabs.map(([label, tab, hash]) => (
                <Link
                  key={tab}
                  href={`/competition/events/${event.id}?tab=${tab}${hash}`}
                  className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-black transition ${
                    currentTab === tab ? "border-white bg-white text-black" : "border-white/10 text-zinc-300 hover:bg-white hover:text-black"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

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
                <div className="mt-8 rounded-[2rem] border border-white/10 bg-black p-5">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Næste handling</p>
                  <h2 className="mt-3 text-2xl font-black">{nextStep.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{nextStep.detail}</p>
                  <Link href={`/competition/events/${event.id}?tab=${nextStep.href}${tabHash(nextStep.href)}`} className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">
                    {nextStep.label === "Afslut event" && eventCanComplete ? "Gå til afslutning" : "Gå til næste trin"}
                  </Link>
                </div>
                <div className="mt-6 grid gap-3">
                  {workflowSteps.map((step, index) => (
                    <Link key={step.label} href={`/competition/events/${event.id}?tab=${step.href}${tabHash(step.href)}`} className="grid gap-3 rounded-2xl border border-white/10 bg-black p-4 transition hover:border-white/30 md:grid-cols-[44px_1fr_auto] md:items-center">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${step.done ? "bg-emerald-400 text-black" : index === workflowSteps.findIndex((item) => !item.done) ? "bg-yellow-300 text-black" : "bg-white/10 text-zinc-400"}`}>
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
                  <MiniStat label="Galleri" value={event._count.gallery} />
                </div>
                <Link href={`/events/${event.id}`} className="mt-6 inline-flex min-w-40 items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">
                  Åbn public event
                </Link>
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

            {currentTab === "settings" ? <section id="indstillinger" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <h2 className="mb-7 text-3xl font-black">Rediger event</h2>
              <form action={updateAction} className="grid gap-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  <Field label="Titel" name="title" defaultValue={event.title} />
                  <Field label="Lokation" name="location" defaultValue={event.location ?? ""} />
                  <Field label="Dato og tid" name="startsAt" type="datetime-local" defaultValue={toInputDate(event.startsAt)} />
                  <Field label="Slut" name="endsAt" type="datetime-local" defaultValue={toInputDate(event.endsAt)} />
                  <Field label="Tilmelding åbner" name="registrationOpenAt" type="datetime-local" defaultValue={toInputDate(event.registrationOpenAt)} />
                  <Field label="Tilmelding lukker" name="registrationCloseAt" type="datetime-local" defaultValue={toInputDate(event.registrationCloseAt)} />
                  <Field label="Maks deltagere" name="maxParticipants" type="number" defaultValue={event.maxParticipants?.toString() ?? ""} />
                  <Field label="Sortering" name="sortOrder" type="number" defaultValue={String(event.sortOrder)} />
                  <Field label="Billed-URL" name="imageUrl" defaultValue={event.bannerUrl ?? ""} />
                  <Field label="Thumbnail-URL" name="thumbnailUrl" defaultValue={event.thumbnailUrl ?? ""} />
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
                  <button formAction={archiveAction} className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-orange-400/30 px-6 py-3 font-black text-orange-200 transition hover:bg-orange-400 hover:text-black" type="submit">Arkivér event</button>
                </div>
              </form>
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
                  <p className="mt-3 text-sm text-emerald-100/70">Indtast resultater, før eventet kan afsluttes.</p>
                ) : null}
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
            </section> : null}

            {currentTab === "participants" ? <section id="deltagere" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <h2 className="mb-7 text-3xl font-black">Deltagerstyring</h2>
              <div className="mb-6 grid gap-3 md:grid-cols-4">
                <MiniStat label="Alle" value={event.registrations.length} />
                <MiniStat label="Afventer" value={event.registrations.filter((registration) => registration.status === "PENDING").length} />
                <MiniStat label="Godkendte" value={event.registrations.filter((registration) => registration.status === "APPROVED").length} />
                <MiniStat label="Tjekket ind" value={event.registrations.filter((registration) => registration.status === "CHECKED_IN").length} />
              </div>
              <div className="grid gap-4">
                {event.registrations.map((registration) => (
                  <article key={registration.id} className="grid gap-4 rounded-2xl border border-white/10 bg-black p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-black">{registration.user.displayName}</h3>
                        <StatusBadge status={registration.status} />
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-zinc-400">
                          {registration.checkedInAt ? "Tjekket ind" : "Ikke tjekket ind"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">
                        {registration.user.darklightId ?? registration.user.username} · {registration.vehicle?.displayName ?? "Køretøj ikke valgt"} · {registration.createdAt.toLocaleString("da-DK")}
                      </p>
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
                ))}
                {event.registrations.length === 0 ? <EmptyState text="Ingen tilmeldinger endnu. Del public eventlinket eller tilføj deltagere manuelt på en konkurrence." href={`/competition/events/${event.id}?tab=heats#køreliste`} action="Tilføj manuelt" /> : null}
              </div>
            </section> : null}

            {currentTab === "vehicles" ? <section id="køretøjer" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <h2 className="mb-7 text-3xl font-black">Køretøjer på eventet</h2>
              <div className="grid gap-4">
                {eventVehicles.map((registration) => {
                  const vehicle = registration.vehicle;
                  if (!vehicle) return null;
                  const latestInspection = vehicle.inspections[0];
                  const checklistApproved = latestInspection ? vehicle.inspections[0].items.filter((item) => item.result === "APPROVED").length : 0;
                  const checklistTotal = latestInspection?.items.length ?? 0;

                  return (
                    <article key={registration.id} className="grid gap-4 rounded-2xl border border-white/10 bg-black p-5 xl:grid-cols-[1fr_auto] xl:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-black">{vehicle.displayName}</h3>
                          <StatusBadge status={latestInspection?.status ?? "PENDING"} />
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-zinc-400">{vehicle.status}</span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                          {registration.user.displayName} · {vehicle.licensePlate ?? "Ingen plade"} · Klasse: {vehicle.vehicleClass ?? "Ikke angivet"} · Eventkategori: {vehicle.eventCategory ?? "Ikke angivet"}
                        </p>
                        <p className="mt-2 text-sm text-zinc-500">
                          Checklist: {checklistTotal > 0 ? `${checklistApproved}/${checklistTotal}` : "Der er endnu ikke oprettet en checklist til dette køretøj."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <form action={updateEventVehicleStatusAction.bind(null, registration.id, "APPROVED")}><SmallButton>Godkend</SmallButton></form>
                        <form action={updateEventVehicleStatusAction.bind(null, registration.id, "REJECTED")}><SmallButton danger>Afvis</SmallButton></form>
                        <Link href={`/admin/vehicles/${vehicle.id}`} className="inline-flex min-w-24 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                          Checklist
                        </Link>
                        <Link href={`/profile/vehicles/${vehicle.id}`} className="inline-flex min-w-24 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                          Se køretøj
                        </Link>
                      </div>
                    </article>
                  );
                })}
                {eventVehicles.length === 0 ? <EmptyState text="Ingen tilmeldte deltagere har valgt køretøj endnu. Godkend deltagere eller bed dem vælge køretøj før syn." href={`/competition/events/${event.id}?tab=participants#deltagere`} action="Gå til deltagere" /> : null}
              </div>
            </section> : null}

            {currentTab === "heats" ? <section id="køreliste" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <h2 className="mb-7 text-3xl font-black">Konkurrencer og kørelister</h2>
              <div className="grid gap-6 xl:grid-cols-2">
                {event.competitions.map((competition) => (
                  <article key={competition.id} className="rounded-2xl border border-white/10 bg-black p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{competition.type}</p>
                    <h3 className="mt-3 text-2xl font-black">{competition.title}</h3>
                    <div className="mt-5 grid gap-3 md:grid-cols-4">
                      <MiniStat label="Deltagere" value={competition.participants.length} />
                      <MiniStat label="Resultater" value={competition.results.length} />
                      <MiniStat label="Heats" value={competition.heats.length} />
                      <MiniStat label="Brackets" value={competition.brackets.length} />
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
                        <SmallButton>Lav køreliste</SmallButton>
                      </form>
                      <form action={lockHeatsAction.bind(null, competition.id)}><SmallButton>Lås heats</SmallButton></form>
                      <Link href={`/competition/events/${event.id}?tab=bracket#bracket`} className="inline-flex min-w-24 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                        Gå til bracket
                      </Link>
                    </div>

                    <div className="mt-5 grid gap-4">
                      {competition.heats.map((heat) => (
                        <div key={heat.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <p className="font-black">{heat.title} · {heat.status}</p>
                          <p className="mt-1 text-sm text-zinc-500">
                            {heat.entries.map((entry) => `${entry.startPosition}. ${entry.participant.name}`).join(" / ") || "Ingen deltagere"}
                          </p>
                        </div>
                      ))}
                      {competition.heats.length === 0 ? <EmptyState text={competition.participants.length < 2 ? "Der er ikke nok godkendte deltagere. Godkend deltagere før køreliste kan laves." : "Ingen køreliste endnu. Brug Lav køreliste for at generere heats."} href={competition.participants.length < 2 ? `/competition/events/${event.id}?tab=participants#deltagere` : undefined} action={competition.participants.length < 2 ? "Godkend deltagere" : undefined} /> : null}
                    </div>

                    <Link href={`/competition/events/${event.id}?tab=results#resultater`} className="mt-5 inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                      Indtast resultater
                    </Link>
                  </article>
                ))}
                {event.competitions.length === 0 ? <EmptyState text="Ingen konkurrencer knyttet til eventet endnu." href={`/competition/events/${event.id}?tab=settings#indstillinger`} action="Gå til indstillinger" /> : null}
              </div>
            </section> : null}

            {currentTab === "bracket" ? <section id="bracket" className="mt-8 scroll-mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <h2 className="mb-7 text-3xl font-black">Bracket</h2>
              <div className="grid gap-6 xl:grid-cols-2">
                {event.competitions.map((competition) => (
                  <article key={competition.id} className="rounded-2xl border border-white/10 bg-black p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{competition.type}</p>
                    <h3 className="mt-3 text-2xl font-black">{competition.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                      {competition.participants.length < 2 ? "Der skal mindst være to deltagere for at generere bracket." : competition.heats.length === 0 ? "Lav køreliste først, hvis bracket skal følge heat/seed-flowet." : "Bracket kan genereres og gemmes i PostgreSQL."}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <form action={generateBracketAction.bind(null, competition.id)}><SmallButton>Generér bracket</SmallButton></form>
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
                        </div>
                      ))}
                      {competition.brackets.length === 0 ? <EmptyState text="Ingen bracket oprettet endnu. Klik Generér bracket, når deltagerne er klar." href={competition.participants.length < 2 ? `/competition/events/${event.id}?tab=participants#deltagere` : competition.heats.length === 0 ? `/competition/events/${event.id}?tab=heats#køreliste` : undefined} action={competition.participants.length < 2 ? "Godkend deltagere" : competition.heats.length === 0 ? "Lav køreliste" : undefined} /> : null}
                    </div>
                  </article>
                ))}
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

              {event.competitions.length === 0 ? (
                <EmptyState text="Der er ingen konkurrencer på eventet endnu. Opret en konkurrence, før resultater kan indtastes." />
              ) : (
                <div className="grid gap-6">
                  {event.competitions.map((competition) => (
                    <ResultEntryPanel key={competition.id} competition={competition} />
                  ))}
                </div>
              )}
            </section> : null}

            {currentTab === "live" ? <section id="live" className="mt-8 scroll-mt-8 grid gap-8 xl:grid-cols-2">
              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
                <h2 className="mb-7 text-3xl font-black">Live announcements</h2>
                <form action={announcementAction} className="grid gap-3">
                  <input name="title" placeholder="Titel" className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none" />
                  <textarea name="message" placeholder="Besked" rows={4} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none" />
                  <label className="flex items-center gap-3 text-sm font-bold text-zinc-300"><input type="checkbox" name="publish" defaultChecked /> Publicér nu</label>
                  <button className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 font-black text-black" type="submit">Tilføj announcement</button>
                </form>
              </div>

              <div className="rounded-[2.5rem] border border-red-500/20 bg-red-500/10 p-8">
                <h2 className="text-3xl font-black text-red-100">Permanent sletning</h2>
                <p className="mt-4 text-sm leading-6 text-red-100/80">
                  Kun Super Admin. Sletning blokeres, hvis eventet har historiske resultater eller Hall of Fame.
                </p>
                <form action={deleteAction} className="mt-5 grid gap-3">
                  <input name="confirmation" placeholder={`Skriv: SLET ${event.title}`} className="rounded-2xl border border-red-500/30 bg-black px-4 py-3 text-white outline-none" />
                  <button className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-red-500 px-6 py-3 font-black text-white" type="submit">Slet permanent</button>
                </form>
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

function ResultEntryPanel({ competition }: { competition: EventCenterCompetition }) {
  const resultsByParticipant = new Map(competition.results.map((result) => [result.participantId, result]));
  const lockAction = lockCompetitionResultsAction.bind(null, competition.id);
  const saveAllAction = saveAllResultsAction.bind(null, competition.id);
  const saveOneAction = saveResultAction.bind(null, competition.id);

  return (
    <article className="rounded-[2rem] border border-white/10 bg-black p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{competition.type}</p>
          <h3 className="mt-3 text-3xl font-black">{competition.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">{resultHelpText(competition.type)}</p>
        </div>
        <form action={lockAction}>
          <button
            disabled={competition.results.length === 0 || competition.results.every((result) => result.locked)}
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            type="submit"
          >
            Lås resultater
          </button>
        </form>
      </div>

      {competition.participants.length === 0 ? (
        <EmptyState text="Der er endnu ingen deltagere klar til resultatindtastning. Godkend tilmeldinger eller tilføj deltagere først." />
      ) : (
        <form action={saveAllAction} className="grid gap-4">
          {competition.participants.map((participant) => {
            const result = resultsByParticipant.get(participant.id);
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

                <div className="grid gap-3 lg:grid-cols-6">
                  {competition.type === "DRAG" ? <ResultInput label="Reaktionstid (ms)" name="reactionTimeMs" defaultValue={result?.reactionTimeMs} /> : <input type="hidden" name="reactionTimeMs" value={result?.reactionTimeMs ?? ""} />}
                  {competition.type === "RACE" || competition.type === "DRAG" ? <ResultInput label="Tid (ms)" name="finishTimeMs" defaultValue={result?.finishTimeMs} /> : <input type="hidden" name="finishTimeMs" value={result?.finishTimeMs ?? ""} />}
                  {competition.type === "CAR_SHOW" ? <ResultInput label="Kategori/noter" name="notes" defaultValue={result?.notes ?? ""} text /> : <input type="hidden" name="notes" value={result?.notes ?? ""} />}
                  <ResultInput label="Placering" name="placement" defaultValue={result?.placement} />
                  {competition.type !== "DRAG" ? <ResultInput label="Point" name="points" defaultValue={result?.points} /> : <input type="hidden" name="points" value={result?.points ?? ""} />}
                  <label className="grid gap-2 text-sm font-bold text-zinc-300">
                    Status
                    <select name="status" defaultValue={result?.status ?? "APPROVED"} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none">
                      <option value="APPROVED">Godkendt</option>
                      <option value="DNF">DNF</option>
                      <option value="DNS">DNS</option>
                      <option value="DISQUALIFIED">Diskvalificeret</option>
                      <option value="PENDING">Afventer</option>
                    </select>
                  </label>
                  <button
                    className="inline-flex shrink-0 items-center justify-center self-end whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300"
                    formAction={saveOneAction}
                    name="rowParticipantId"
                    type="submit"
                    value={participant.id}
                  >
                    {result ? "Ret resultat" : "Gem resultat"}
                  </button>
                </div>
              </div>
            );
          })}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-white">Gem alle resultater</p>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Validerer alle rækker og gemmer dem samlet. Hvis én række fejler, gemmes ingen delvise resultater.
              </p>
            </div>
            <button className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-zinc-300" type="submit">
              Gem alle resultater
            </button>
          </div>
        </form>
      )}
    </article>
  );
}

function ResultInput({ label, name, defaultValue, text = false }: { label: string; name: string; defaultValue?: string | number | null; text?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-zinc-300">
      {label}
      <input
        name={name}
        type={text ? "text" : "number"}
        min={text ? undefined : "0"}
        defaultValue={defaultValue ?? ""}
        className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none"
      />
    </label>
  );
}

function resultHelpText(type: string) {
  if (type === "RACE") return "Race viser tid, placering, point og DNF/DNS/diskvalifikation.";
  if (type === "DRAG") return "Drag viser reaktionstid, sluttid, placering/vinder og status.";
  if (type === "DRIFT") return "Drift viser point, placering og status.";
  if (type === "CAR_SHOW") return "Car Show viser kategori/noter, point og placering.";
  return "Indtast de relevante point, placeringer og status for konkurrencen.";
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

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    PENDING: "Afventer godkendelse",
    APPROVED: "Godkendt",
    REJECTED: "Afvist",
    CANCELLED: "Fjernet",
    CHECKED_IN: "Tjekket ind",
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
