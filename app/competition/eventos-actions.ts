"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/admin/audit";
import { createBracketPlan, createHeatPlan } from "@/lib/eventos/engine";

type StaffRole = "SUPER_ADMIN" | "ADMIN" | "EVENT_MANAGER";

function assertStaff(role: string): asserts role is StaffRole {
  if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "EVENT_MANAGER") {
    throw new Error("Ingen adgang til EventOS-handlingen.");
  }
}

function revalidateEventOS() {
  revalidatePath("/competition/control-center");
  revalidatePath("/competition/heat-manager");
  revalidatePath("/competition/live-center");
  revalidatePath("/competition/tablet");
  revalidatePath("/competition/results");
  revalidatePath("/live-resultater");
  revalidatePath("/rangliste");
  revalidatePath("/events");
}

function readInt(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

type ParsedResultRow = {
  participantId: string;
  placement: number;
  points: number;
  finishTimeMs: number | null;
  reactionTimeMs: number | null;
  notes: string | null;
  status: "APPROVED" | "DNF" | "DNS" | "DISQUALIFIED" | "PENDING" | "REJECTED";
};

function readFormValue(values: FormDataEntryValue[], index: number) {
  return values[index] ?? null;
}

function parseResultStatus(value: FormDataEntryValue | null): ParsedResultRow["status"] {
  const rawStatus = String(value ?? "APPROVED");
  if (rawStatus === "DNF" || rawStatus === "DNS" || rawStatus === "DISQUALIFIED" || rawStatus === "PENDING" || rawStatus === "REJECTED") {
    return rawStatus;
  }
  return "APPROVED";
}

function parseResultRows(formData: FormData) {
  const participantIds = formData.getAll("participantId");
  const placements = formData.getAll("placement");
  const points = formData.getAll("points");
  const finishTimes = formData.getAll("finishTimeMs");
  const reactionTimes = formData.getAll("reactionTimeMs");
  const notes = formData.getAll("notes");
  const statuses = formData.getAll("status");

  return participantIds.map((participantIdValue, index) => {
    const participantId = String(participantIdValue ?? "").trim();
    const status = parseResultStatus(readFormValue(statuses, index));
    const placementInput = readInt(readFormValue(placements, index), 0);
    const placement = placementInput > 0 ? placementInput : status === "APPROVED" ? 0 : 999;
    const pointFallback = status === "APPROVED" ? Math.max(1000 - placement, 0) : 0;
    const rowNotes = String(readFormValue(notes, index) ?? "").trim();

    return {
      participantId,
      placement,
      points: readInt(readFormValue(points, index), pointFallback),
      finishTimeMs: readInt(readFormValue(finishTimes, index), 0) || null,
      reactionTimeMs: readInt(readFormValue(reactionTimes, index), 0) || null,
      notes: rowNotes || null,
      status,
    };
  });
}

function validateResultRow(row: ParsedResultRow, index: number) {
  const rowLabel = `Række ${index + 1}`;
  if (!row.participantId) {
    throw new Error(`${rowLabel}: Deltager mangler.`);
  }
  if (row.placement < 1) {
    throw new Error(`${rowLabel}: Placering er påkrævet.`);
  }
  if (row.points < 0) {
    throw new Error(`${rowLabel}: Point må ikke være negativt.`);
  }
}

async function getCompetitionForResultSave(competitionId: string) {
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: { event: { select: { id: true, title: true } } },
  });
  if (!competition) throw new Error("Konkurrencen findes ikke.");
  return competition;
}

const countedRegistrationStatuses = ["PENDING", "APPROVED", "CHECKED_IN"] as const;

export async function registerForEventAction(eventId: string, formData: FormData) {
  const user = await requireCurrentUser();
  const vehicleId = String(formData.get("vehicleId") ?? "").trim() || null;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      active: true,
      public: true,
      status: true,
      maxParticipants: true,
      registrationOpenAt: true,
      registrationCloseAt: true,
      registrations: {
        where: { status: { in: [...countedRegistrationStatuses] } },
        select: { id: true },
      },
    },
  });

  if (!event || !event.active || !event.public) {
    throw new Error("Eventet kan ikke findes eller er ikke åbent.");
  }

  const now = new Date();
  const registrationOpen =
    event.status === "REGISTRATION_OPEN" &&
    (!event.registrationOpenAt || event.registrationOpenAt <= now) &&
    (!event.registrationCloseAt || event.registrationCloseAt >= now);

  if (!registrationOpen) {
    throw new Error("Tilmeldingen er ikke åben.");
  }

  if (event.maxParticipants && event.registrations.length >= event.maxParticipants) {
    throw new Error("Eventet er fuldt booket.");
  }

  const existingRegistration = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
    select: { status: true },
  });

  if (existingRegistration?.status === "PENDING") {
    throw new Error("Din tilmelding afventer allerede godkendelse.");
  }

  if (existingRegistration?.status === "APPROVED" || existingRegistration?.status === "CHECKED_IN") {
    throw new Error("Du er allerede tilmeldt eventet.");
  }

  if (existingRegistration?.status === "REJECTED") {
    throw new Error("Din tilmelding er afvist og kan ikke oprettes igen automatisk.");
  }

  if (existingRegistration?.status === "CANCELLED") {
    await prisma.eventRegistration.update({
      where: { eventId_userId: { eventId, userId: user.id } },
      data: { status: "PENDING", vehicleId },
    });
  } else {
    await prisma.eventRegistration.create({
      data: { eventId, userId: user.id, vehicleId, status: "PENDING" },
    });
  }

  await writeAuditLog({
    actorId: user.id,
    action: "EVENT_REGISTRATION_CREATED",
    target: `Event:${eventId}`,
    details: { event: event.title },
  });

  revalidateEventOS();
}

export async function cancelEventRegistrationAction(eventId: string) {
  const user = await requireCurrentUser();

  await prisma.eventRegistration.update({
    where: { eventId_userId: { eventId, userId: user.id } },
    data: { status: "CANCELLED" },
  });

  revalidateEventOS();
}

export async function updateRegistrationStatusAction(id: string, status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "CHECKED_IN") {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const registration = await prisma.eventRegistration.update({
    where: { id },
    data: {
      status,
      checkedInAt: status === "CHECKED_IN" ? new Date() : null,
      decidedAt: status === "APPROVED" || status === "REJECTED" ? new Date() : undefined,
    },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { displayName: true } },
      vehicle: { select: { displayName: true, licensePlate: true } },
    },
  });

  const competition = await prisma.competition.findFirst({
    where: { eventId: registration.eventId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if ((status === "APPROVED" || status === "CHECKED_IN") && competition) {
    await prisma.participant.upsert({
      where: { competitionId_userId: { competitionId: competition.id, userId: registration.userId } },
      update: {
        name: registration.user.displayName,
        vehicle: registration.vehicle?.displayName ?? null,
        number: registration.competitionNumber,
        checkedInAt: status === "CHECKED_IN" ? new Date() : null,
        status,
      },
      create: {
        competitionId: competition.id,
        userId: registration.userId,
        registrationId: registration.id,
        name: registration.user.displayName,
        vehicle: registration.vehicle?.displayName ?? null,
        number: registration.competitionNumber,
        status,
        checkedInAt: status === "CHECKED_IN" ? new Date() : null,
      },
    });
  }

  if ((status === "PENDING" || status === "REJECTED" || status === "CANCELLED") && competition) {
    await prisma.participant.deleteMany({
      where: {
        competitionId: competition.id,
        userId: registration.userId,
        results: { none: {} },
      },
    });
  }

  await writeAuditLog({
    actorId: user.id,
    action: `EVENT_REGISTRATION_${status}`,
    target: `EventRegistration:${id}`,
    details: { event: registration.event.title, user: registration.user.displayName },
  });

  revalidateEventOS();
}

export async function updateEventVehicleStatusAction(registrationId: string, status: "APPROVED" | "REJECTED") {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    include: {
      event: { select: { id: true, title: true } },
      vehicle: {
        select: {
          id: true,
          displayName: true,
          inspections: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true },
          },
        },
      },
    },
  });

  if (!registration?.vehicle) {
    throw new Error("Tilmeldingen har ikke et køretøj tilknyttet.");
  }

  const vehicle = registration.vehicle;

  await prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { status: status === "APPROVED" ? "ACTIVE" : "SUSPENDED" },
    });

    const latestInspection = vehicle.inspections[0];
    if (latestInspection) {
      await tx.vehicleInspection.update({
        where: { id: latestInspection.id },
        data: {
          status,
          inspectedById: user.id,
          inspectedAt: new Date(),
        },
      });
    }
  });

  await writeAuditLog({
    actorId: user.id,
    action: `EVENT_VEHICLE_${status}`,
    target: `Vehicle:${vehicle.id}`,
    details: { event: registration.event.title, vehicle: vehicle.displayName },
  });

  revalidateEventOS();
}

export async function addManualParticipantAction(competitionId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const name = String(formData.get("name") ?? "").trim();
  const vehicle = String(formData.get("vehicle") ?? "").trim();
  const number = String(formData.get("number") ?? "").trim();
  const seed = readInt(formData.get("seed"), 0) || null;

  if (!name) {
    throw new Error("Deltager skal have et navn.");
  }

  const participant = await prisma.participant.create({
    data: {
      competitionId,
      name,
      vehicle: vehicle || null,
      number: number || null,
      seed,
      status: "APPROVED",
    },
    include: { competition: { include: { event: { select: { id: true, title: true } } } } },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "PARTICIPANT_CREATED",
    target: `Participant:${participant.id}`,
    details: { event: participant.competition.event.title, name },
  });

  revalidateEventOS();
}

export async function removeParticipantAction(id: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const participant = await prisma.participant.findUnique({
    where: { id },
    include: {
      results: { select: { id: true } },
      competition: { include: { event: { select: { id: true, title: true } } } },
    },
  });

  if (!participant) {
    throw new Error("Deltageren findes ikke.");
  }

  if (participant.results.length > 0) {
    throw new Error("Deltageren har resultater og kan ikke fjernes. Arkivér/ret resultatet først.");
  }

  await prisma.participant.delete({ where: { id } });
  await writeAuditLog({
    actorId: user.id,
    action: "PARTICIPANT_DELETED",
    target: `Participant:${id}`,
    details: { event: participant.competition.event.title, name: participant.name },
  });

  revalidateEventOS();
}

export async function generateHeatsAction(competitionId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const participantsPerHeat = readInt(formData.get("participantsPerHeat"), 4);

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: {
      event: { select: { id: true, title: true } },
      participants: { select: { id: true, name: true, seed: true }, orderBy: [{ seed: "asc" }, { createdAt: "asc" }] },
      heats: { include: { entries: true } },
      results: { select: { id: true } },
    },
  });

  if (!competition) throw new Error("Konkurrencen findes ikke.");
  if (competition.heats.some((heat) => heat.locked || heat.status === "ACTIVE" || heat.status === "COMPLETED" || heat.status === "LOCKED")) {
    throw new Error("Heats er låst eller startet og kan ikke regenereres.");
  }
  if (competition.results.length > 0) {
    throw new Error("Der findes resultater. Heats kan ikke overskrives.");
  }

  const heatPlan = createHeatPlan(competition.participants, participantsPerHeat);

  await prisma.$transaction(async (tx) => {
    await tx.heat.deleteMany({ where: { competitionId } });
    for (const heat of heatPlan) {
      await tx.heat.create({
        data: {
          competitionId,
          title: heat.title,
          heatNumber: heat.heatNumber,
          status: "READY",
          entries: {
            create: heat.entries.map((entry) => ({
              participantId: entry.participantId,
              startPosition: entry.startPosition,
            })),
          },
        },
      });
    }
  });

  await writeAuditLog({
    actorId: user.id,
    action: "HEATS_GENERATED",
    target: `Competition:${competitionId}`,
    details: { event: competition.event.title, heats: heatPlan.length, participantsPerHeat },
  });

  revalidateEventOS();
}

export async function lockHeatsAction(competitionId: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const competition = await prisma.competition.update({
    where: { id: competitionId },
    data: { heats: { updateMany: { where: { locked: false }, data: { locked: true, status: "LOCKED" } } } },
    include: { event: { select: { id: true, title: true } } },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "HEATS_LOCKED",
    target: `Competition:${competitionId}`,
    details: { event: competition.event.title },
  });

  revalidateEventOS();
}

export async function generateBracketAction(competitionId: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: {
      event: { select: { id: true, title: true } },
      participants: { select: { id: true, name: true, seed: true }, orderBy: [{ seed: "asc" }, { createdAt: "asc" }] },
      brackets: { include: { matches: true } },
    },
  });

  if (!competition) throw new Error("Konkurrencen findes ikke.");
  if (competition.participants.length < 2) throw new Error("Der skal mindst være to deltagere for at lave bracket.");
  if (competition.brackets.some((bracket) => bracket.locked || bracket.status === "ACTIVE" || bracket.status === "COMPLETED" || bracket.status === "LOCKED")) {
    throw new Error("Bracket er låst eller startet og kan ikke regenereres.");
  }

  const plan = createBracketPlan(competition.participants);

  await prisma.$transaction(async (tx) => {
    await tx.bracket.deleteMany({ where: { competitionId } });
    await tx.bracket.create({
      data: {
        competitionId,
        title: `${competition.title} bracket`,
        type: competition.type,
        size: plan.size,
        status: "READY",
        matches: {
          create: plan.matches.map((match) => ({
            round: match.round,
            matchNumber: match.matchNumber,
            participantAId: match.participantAId,
            participantBId: match.participantBId,
            winnerId: match.winnerId ?? null,
            status: match.winnerId ? "COMPLETED" : "PENDING",
            completedAt: match.winnerId ? new Date() : null,
          })),
        },
      },
    });
  });

  await writeAuditLog({
    actorId: user.id,
    action: "BRACKET_GENERATED",
    target: `Competition:${competitionId}`,
    details: { event: competition.event.title, size: plan.size },
  });

  revalidateEventOS();
}

export async function selectMatchWinnerAction(matchId: string, winnerId: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const match = await prisma.bracketMatch.update({
    where: { id: matchId },
    data: { winnerId, status: "COMPLETED", completedAt: new Date() },
    include: { bracket: { include: { competition: { include: { event: { select: { id: true, title: true } } } } } } },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "BRACKET_WINNER_SELECTED",
    target: `BracketMatch:${matchId}`,
    details: { event: match.bracket.competition.event.title, winnerId },
  });

  revalidateEventOS();
}

export async function saveResultAction(competitionId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const rowParticipantId = String(formData.get("rowParticipantId") ?? "").trim();
  const rows = parseResultRows(formData);
  const rowIndex = rowParticipantId ? rows.findIndex((row) => row.participantId === rowParticipantId) : 0;
  const row = rows[rowIndex];
  if (!row) throw new Error("Resultatrækken kunne ikke findes.");
  validateResultRow(row, rowIndex);

  const competition = await getCompetitionForResultSave(competitionId);

  const existingResult = await prisma.result.findUnique({
    where: { competitionId_participantId: { competitionId, participantId: row.participantId } },
    select: { locked: true },
  });

  if (existingResult?.locked && user.role === "EVENT_MANAGER") {
    throw new Error("Resultatet er låst. Kontakt Admin eller Super Admin for at rette det.");
  }

  const result = await prisma.result.upsert({
    where: { competitionId_participantId: { competitionId, participantId: row.participantId } },
    update: {
      placement: row.placement,
      points: row.points,
      finishTimeMs: row.finishTimeMs,
      reactionTimeMs: row.reactionTimeMs,
      notes: row.notes,
      status: row.status,
      createdById: user.id,
    },
    create: {
      competitionId,
      participantId: row.participantId,
      placement: row.placement,
      points: row.points,
      finishTimeMs: row.finishTimeMs,
      reactionTimeMs: row.reactionTimeMs,
      notes: row.notes,
      status: row.status,
      createdById: user.id,
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "RESULT_SAVED",
    target: `Result:${result.id}`,
    details: { event: competition.event.title, placement: row.placement, status: row.status },
  });

  revalidateEventOS();
  redirect(`/competition/events/${competition.event.id}?tab=results&saved=results#resultater`);
}

export async function saveAllResultsAction(competitionId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const rows = parseResultRows(formData);
  if (rows.length === 0) {
    throw new Error("Der er ingen resultater at gemme.");
  }
  rows.forEach((row, index) => validateResultRow(row, index));

  const participantIds = rows.map((row) => row.participantId);
  if (new Set(participantIds).size !== participantIds.length) {
    throw new Error("Samme deltager optræder flere gange i resultatlisten.");
  }

  const competition = await getCompetitionForResultSave(competitionId);
  const lockedResults = await prisma.result.findMany({
    where: { competitionId, participantId: { in: participantIds }, locked: true },
    select: { participantId: true },
  });

  if (lockedResults.length > 0 && user.role === "EVENT_MANAGER") {
    throw new Error("Et eller flere resultater er låst. Kontakt Admin eller Super Admin for at rette dem.");
  }

  await prisma.$transaction(
    rows.map((row) =>
      prisma.result.upsert({
        where: { competitionId_participantId: { competitionId, participantId: row.participantId } },
        update: {
          placement: row.placement,
          points: row.points,
          finishTimeMs: row.finishTimeMs,
          reactionTimeMs: row.reactionTimeMs,
          notes: row.notes,
          status: row.status,
          createdById: user.id,
        },
        create: {
          competitionId,
          participantId: row.participantId,
          placement: row.placement,
          points: row.points,
          finishTimeMs: row.finishTimeMs,
          reactionTimeMs: row.reactionTimeMs,
          notes: row.notes,
          status: row.status,
          createdById: user.id,
        },
      }),
    ),
  );

  await writeAuditLog({
    actorId: user.id,
    action: "RESULTS_BULK_SAVED",
    target: `Competition:${competitionId}`,
    details: { event: competition.event.title, results: rows.length },
  });

  revalidateEventOS();
  redirect(`/competition/events/${competition.event.id}?tab=results&saved=results#resultater`);
}

export async function lockCompetitionResultsAction(competitionId: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: { event: { select: { id: true, title: true } }, results: { select: { id: true } } },
  });

  if (!competition) throw new Error("Konkurrencen findes ikke.");
  if (competition.results.length === 0) throw new Error("Der er ingen resultater at låse endnu.");

  await prisma.result.updateMany({
    where: { competitionId },
    data: { locked: true },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "RESULTS_LOCKED",
    target: `Competition:${competitionId}`,
    details: { event: competition.event.title, results: competition.results.length },
  });

  revalidateEventOS();
}

export async function completeEventAction(eventId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  if (formData.get("confirmComplete") !== "on") {
    throw new Error("Bekræft at eventet skal afsluttes.");
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      competitions: {
        include: {
          participants: { select: { id: true } },
          results: { select: { id: true } },
        },
      },
    },
  });

  if (!event) throw new Error("Eventet findes ikke.");
  if (event.status === "COMPLETED" || event.status === "ARCHIVED") {
    throw new Error("Eventet er allerede afsluttet eller arkiveret.");
  }
  if (event.competitions.length === 0) {
    throw new Error("Eventet har ingen konkurrencer og kan ikke afsluttes endnu.");
  }

  const missingResults = event.competitions.filter(
    (competition) => competition.participants.length > 0 && competition.results.length === 0,
  );
  if (missingResults.length > 0) {
    throw new Error("Der mangler resultater på en eller flere konkurrencer.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.result.updateMany({
      where: { competition: { eventId } },
      data: { locked: true },
    });

    await tx.event.update({
      where: { id: eventId },
      data: {
        status: "COMPLETED",
        registrationCloseAt: event.registrationCloseAt ?? new Date(),
      },
    });
  });

  await writeAuditLog({
    actorId: user.id,
    action: "EVENT_COMPLETED",
    target: `Event:${event.id}`,
    details: {
      title: event.title,
      competitions: event.competitions.length,
      note: "Resultater låst og tilmelding lukket.",
    },
  });

  revalidateEventOS();
  revalidatePath(`/competition/events/${event.id}`);
  redirect(`/competition/events/${event.id}?tab=overview#oversigt`);
}

export async function createAnnouncementAction(eventId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const publish = formData.get("publish") === "on";

  if (!title || !message) {
    throw new Error("Announcement skal have titel og tekst.");
  }

  const announcement = await prisma.eventAnnouncement.create({
    data: {
      eventId,
      authorId: user.id,
      title,
      message,
      status: publish ? "PUBLISHED" : "DRAFT",
      publishedAt: publish ? new Date() : null,
    },
    include: { event: { select: { id: true, title: true } } },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "EVENT_ANNOUNCEMENT_CREATED",
    target: `EventAnnouncement:${announcement.id}`,
    details: { event: announcement.event.title, published: publish },
  });

  revalidateEventOS();
}

export async function updateTaskStatusAction(id: string, status: "IN_PROGRESS" | "DONE" | "DISMISSED") {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const task = await prisma.eventTask.update({
    where: { id },
    data: { status },
    include: { event: { select: { id: true, title: true } } },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "EVENT_TASK_UPDATED",
    target: `EventTask:${id}`,
    details: { title: task.title, status },
  });

  revalidateEventOS();
}

export async function duplicateEventAction(id: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const event = await prisma.event.findUnique({ where: { id }, include: { competitions: true } });
  if (!event) throw new Error("Eventet findes ikke.");

  const copy = await prisma.event.create({
    data: {
      title: `${event.title} kopi`,
      slug: `${event.id}-kopi-${Date.now()}`,
      description: event.description,
      bannerUrl: event.bannerUrl,
      imageAlt: event.imageAlt,
      thumbnailUrl: event.thumbnailUrl,
      location: event.location,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      registrationOpenAt: event.registrationOpenAt,
      registrationCloseAt: event.registrationCloseAt,
      maxParticipants: event.maxParticipants,
      status: "DRAFT",
      sortOrder: event.sortOrder,
      active: false,
      public: false,
      createdById: user.id,
      competitions: {
        create: event.competitions.map((competition) => ({
          title: competition.title,
          type: competition.type,
          description: competition.description,
        })),
      },
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "EVENT_DUPLICATED",
    target: `Event:${copy.id}`,
    details: { sourceEventId: id, title: copy.title },
  });

  revalidateEventOS();
  redirect(`/competition/events/${copy.id}?tab=settings#indstillinger`);
}
