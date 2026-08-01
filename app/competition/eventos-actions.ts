"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/admin/audit";
import { createBracketPlan, createHeatPlan } from "@/lib/eventos/engine";
import { assertEventFeature } from "@/lib/events/event-features";
import { COUNTED_REGISTRATION_STATUSES, getRegistrationState } from "@/lib/events/registration-state";
import { normalizeInternalNote } from "@/lib/events/command-center-operations";
import { canMutateResultForEventStatus, canUnlockResults, validateResultRows as validateResultRuleRows } from "@/lib/events/result-rules";
import { parseResultTime } from "@/lib/events/result-time";
import { resultHistoryChanged, resultHistorySnapshot } from "@/lib/events/result-history";
import { assertPrizePartLimit, canDeletePrize, prizeIdentity } from "@/lib/events/prize-rules";
import { normalizePrizeCurrencyForType } from "@/lib/events/prize-currency";
import { isResultEligibleStatus, syncApprovedParticipantsToCompetition } from "@/lib/events/result-sync";

type StaffRole = "SUPER_ADMIN" | "ADMIN" | "EVENT_MANAGER";

function assertStaff(role: string): asserts role is StaffRole {
  if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "EVENT_MANAGER") {
    throw new Error("Ingen adgang til EventOS-handlingen.");
  }
}

function revalidateEventOS(eventId?: string) {
  revalidatePath("/competition/control-center");
  revalidatePath("/competition/heat-manager");
  revalidatePath("/competition/live-center");
  revalidatePath("/competition/tablet");
  revalidatePath("/competition/results");
  revalidatePath("/live-resultater");
  revalidatePath("/rangliste");
  revalidatePath("/hall-of-fame");
  revalidatePath("/competition/leaderboard");
  revalidatePath("/dashboard");
  revalidatePath("/competition");
  revalidatePath("/events");
  revalidatePath("/upcoming");
  revalidatePath("/competition/events/[id]", "page");
  revalidatePath("/events/[id]", "page");
  if (eventId) {
    revalidatePath(`/competition/events/${eventId}`);
    revalidatePath(`/events/${eventId}`);
  }
}

function readInt(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readNullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function readPositiveDecimal(value: FormDataEntryValue | null) {
  const text = String(value ?? "").replace(",", ".").trim();
  if (!text) return null;
  const parsed = Number(text);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Beløb skal være et positivt tal.");
  }
  return parsed;
}

function parsePrizeType(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  const allowed = ["CASH", "VEHICLE", "TROPHY", "SPONSOR", "VIP", "ITEM", "SPECIAL", "OTHER"] as const;
  if (!allowed.includes(raw as (typeof allowed)[number])) {
    throw new Error("Vælg en gyldig præmietype.");
  }
  return raw as (typeof allowed)[number];
}

function parsePrizeData(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const prizeType = parsePrizeType(formData.get("prizeType"));
  const placement = readInt(formData.get("placement"), 0) || null;
  const submittedAmount = readPositiveDecimal(formData.get("amount"));
  const amount = prizeType === "CASH" ? submittedAmount : null;
  const currency = normalizePrizeCurrencyForType(prizeType, readNullableString(formData.get("currency")));
  const itemName = readNullableString(formData.get("itemName"));
  const sponsorName = readNullableString(formData.get("sponsorName"));
  const awardLabel = readNullableString(formData.get("awardLabel"));

  if (!title) throw new Error("Præmien skal have en titel.");
  if (placement !== null && placement < 1) throw new Error("Placering skal være positiv.");
  if (prizeType === "CASH" && !amount) throw new Error("Kontantpræmier skal have et beløb.");
  if (prizeType === "SPECIAL" && !awardLabel) throw new Error("Specialpræmier skal have en award-label.");

  return {
    title,
    prizeType,
    placement,
    amount,
    currency,
    itemName,
    sponsorName,
    awardLabel,
    description: readNullableString(formData.get("description")),
    active: formData.get("active") === "on",
  };
}

type ParsedResultRow = {
  participantId: string;
  placement: number;
  points: number | null;
  finishTimeMs: number | null;
  reactionTimeMs: number | null;
  notes: string | null;
  status: "APPROVED" | "DNF" | "DNS" | "DISQUALIFIED" | "PENDING" | "REJECTED";
  placementProvided: boolean;
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
    const placementRaw = String(readFormValue(placements, index) ?? "").trim();
    const placementInput = readInt(placementRaw || null, 0);
    const placement = placementInput > 0 ? placementInput : 0;
    const pointsRaw = String(readFormValue(points, index) ?? "").trim();
    const finishTimeRaw = String(readFormValue(finishTimes, index) ?? "").trim();
    const rowNotes = String(readFormValue(notes, index) ?? "").trim();
    let parsedPoints: number | null = null;
    if (pointsRaw) {
      if (/^-\d+$/.test(pointsRaw)) throw new Error(`Række ${index + 1}: Point må ikke være negativt.`);
      if (!/^\d+$/.test(pointsRaw)) throw new Error(`Række ${index + 1}: Point skal være et gyldigt tal.`);
      parsedPoints = Number(pointsRaw);
    }
    let finishTimeMs: number | null = null;
    try {
      finishTimeMs = parseResultTime(finishTimeRaw);
    } catch (error) {
      throw new Error(`Række ${index + 1}: ${error instanceof Error ? error.message : "Ugyldig tid."}`);
    }

    return {
      participantId,
      placement,
      points: parsedPoints,
      finishTimeMs,
      reactionTimeMs: readInt(readFormValue(reactionTimes, index), 0) || null,
      notes: rowNotes || null,
      status,
      placementProvided: placementRaw !== "",
    };
  });
}

async function getPrizeEvent(prizeId: string) {
  const prize = await prisma.eventPrize.findUnique({
    where: { id: prizeId },
    select: { id: true, eventId: true, title: true, sortOrder: true, event: { select: { title: true } } },
  });
  if (!prize) throw new Error("Præmien blev ikke fundet.");
  return prize;
}

function validateResultRow(row: ParsedResultRow, index: number) {
  const rowLabel = `Række ${index + 1}`;
  if (!row.participantId) {
    throw new Error(`${rowLabel}: Deltager mangler.`);
  }
  if (row.placementProvided && row.placement < 1) {
    throw new Error(`${rowLabel}: Placering skal være positiv.`);
  }
  if (row.points != null && row.points < 0) {
    throw new Error(`${rowLabel}: Point må ikke være negativt.`);
  }
  if (row.points != null && row.points > 1_000_000) throw new Error(`${rowLabel}: Point er uden for det tilladte interval.`);
  if ((row.status === "DNF" || row.status === "DNS") && row.placementProvided) {
    throw new Error(`${rowLabel}: DNF eller DNS må ikke have en normal placering.`);
  }
  if (row.status === "APPROVED" && !row.placementProvided && row.points == null && row.finishTimeMs == null) {
    throw new Error(`${rowLabel}: Indtast mindst tid, point eller placering.`);
  }
}

async function getCompetitionForResultSave(competitionId: string) {
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: { event: { select: { id: true, title: true, status: true, usesResults: true } }, participants: { select: { id: true, status: true } } },
  });
  if (!competition) throw new Error("Konkurrencen findes ikke.");
  assertEventFeature(competition.event.usesResults, "Resultater er ikke aktiveret for dette event.");
  if (competition.event.status === "ARCHIVED" || competition.event.status === "CANCELLED") throw new Error("Resultater kan ikke ændres på et arkiveret eller aflyst event.");
  return competition;
}

export async function registerForEventAction(eventId: string, formData: FormData) {
  const user = await requireCurrentUser();
  void formData;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      active: true,
      public: true,
      status: true,
      startsAt: true,
      endsAt: true,
      maxParticipants: true,
      registrationOpenAt: true,
      registrationCloseAt: true,
      usesParticipantRegistration: true,
      usesVehicles: true,
      registrations: {
        where: { status: { in: [...COUNTED_REGISTRATION_STATUSES] } },
        select: { id: true },
      },
    },
  });

  if (!event || !event.active || !event.public) {
    throw new Error("Eventet kan ikke findes eller er ikke åbent.");
  }
  assertEventFeature(event.usesParticipantRegistration, "Dette event bruger ikke deltagertilmelding.");

  const registrationState = getRegistrationState({
    ...event,
    registeredParticipants: event.registrations.length,
  });

  if (!registrationState.isOpen) {
    throw new Error(registrationState.label);
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
      data: { status: "PENDING", vehicleId: null },
    });
  } else {
    await prisma.eventRegistration.create({
      data: { eventId, userId: user.id, vehicleId: null, status: "PENDING" },
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

  await syncApprovedParticipantsToCompetition(eventId);
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

  await syncApprovedParticipantsToCompetition(registration.event.id);

  await writeAuditLog({
    actorId: user.id,
    action: status === "CHECKED_IN" ? "PARTICIPANT_CHECKED_IN" : `EVENT_REGISTRATION_${status}`,
    target: `EventRegistration:${id}`,
    details: { event: registration.event.title, user: registration.user.displayName },
  });

  revalidateEventOS();
}

export async function assignEventRegistrationVehicleAction(eventId: string, formData: FormData) {
  const user = await requireCurrentUser();
  const vehicleId = String(formData.get("vehicleId") ?? "").trim();
  if (!vehicleId) throw new Error("Vælg et køretøj.");

  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { title: true, usesVehicles: true } });
  if (!event) throw new Error("Eventet findes ikke.");
  assertEventFeature(event.usesVehicles, "Dette event bruger ikke køretøjsregistrering.");

  const [registration, vehicle] = await Promise.all([
    prisma.eventRegistration.findUnique({ where: { eventId_userId: { eventId, userId: user.id } }, select: { id: true, status: true } }),
    prisma.vehicle.findFirst({ where: { id: vehicleId, ownerId: user.id, status: "ACTIVE" }, select: { id: true, displayName: true } }),
  ]);
  if (!registration || !["PENDING", "APPROVED", "CHECKED_IN"].includes(registration.status)) {
    throw new Error("Du skal først være tilmeldt eventet.");
  }
  if (!vehicle) throw new Error("Køretøjet findes ikke eller tilhører ikke din profil.");

  await prisma.eventRegistration.update({ where: { id: registration.id }, data: { vehicleId: vehicle.id } });
  await writeAuditLog({
    actorId: user.id,
    action: "EVENT_REGISTRATION_VEHICLE_ASSIGNED",
    target: `Event:${eventId}`,
    details: { event: event.title, vehicle: vehicle.displayName },
  });
  revalidateEventOS();
  revalidatePath(`/events/${eventId}`);
}

export async function approveAllPendingRegistrationsAction(eventId: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        where: { status: "PENDING" },
        include: {
          user: { select: { id: true, displayName: true } },
          vehicle: { select: { displayName: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: {
          registrations: { where: { status: { in: ["APPROVED", "CHECKED_IN"] } } },
        },
      },
    },
  });

  if (!event) throw new Error("Eventet findes ikke.");
  if (event.registrations.length === 0) throw new Error("Der er ingen afventende tilmeldinger.");
  if (event.maxParticipants && event._count.registrations + event.registrations.length > event.maxParticipants) {
    throw new Error("Kapaciteten er ikke stor nok til at godkende alle afventende tilmeldinger.");
  }
  await prisma.eventRegistration.updateMany({
    where: { eventId, status: "PENDING" },
    data: { status: "APPROVED", decidedAt: new Date() },
  });
  await syncApprovedParticipantsToCompetition(eventId);

  await writeAuditLog({
    actorId: user.id,
    action: "EVENT_REGISTRATIONS_APPROVED_BULK",
    target: `Event:${eventId}`,
    details: { event: event.title, count: event.registrations.length },
  });

  revalidateEventOS();
  redirect(`/competition/events/${eventId}?tab=participants#deltagere`);
}

export async function bulkUpdateRegistrationsAction(
  eventId: string,
  status: "APPROVED" | "REJECTED" | "CHECKED_IN" | "CANCELLED",
  formData: FormData,
) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  if (status === "CANCELLED" && formData.get("confirmBulkRemove") !== "on") throw new Error("Bekræft at de valgte deltagere skal fjernes.");
  const registrationIds = formData.getAll("registrationIds").map(String).filter(Boolean);
  if (registrationIds.length === 0) throw new Error("Vælg mindst én deltager.");
  const registrations = await prisma.eventRegistration.findMany({
    where: { id: { in: registrationIds }, eventId },
    select: { id: true },
  });
  if (registrations.length !== registrationIds.length) throw new Error("En eller flere deltagere tilhører ikke eventet.");
  for (const registration of registrations) await updateRegistrationStatusAction(registration.id, status);
  await writeAuditLog({
    actorId: user.id,
    action: status === "APPROVED" ? "PARTICIPANTS_BULK_APPROVED" : status === "REJECTED" ? "PARTICIPANTS_BULK_REJECTED" : status === "CHECKED_IN" ? "PARTICIPANTS_BULK_CHECKED_IN" : "PARTICIPANTS_BULK_REMOVED",
    target: `Event:${eventId}`,
    details: { count: registrations.length },
  });
  revalidateEventOS();
  redirect(`/competition/events/${eventId}?tab=participants&saved=participants#deltagere`);
}

export async function updateParticipantNoteAction(registrationId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const internalNote = normalizeInternalNote(String(formData.get("internalNote") ?? ""));
  const registration = await prisma.eventRegistration.update({
    where: { id: registrationId },
    data: { internalNote },
    include: { event: { select: { id: true, title: true } }, user: { select: { displayName: true } } },
  });
  await writeAuditLog({
    actorId: user.id,
    action: "PARTICIPANT_NOTE_UPDATED",
    target: `EventRegistration:${registrationId}`,
    details: { event: registration.event.title, participant: registration.user.displayName },
  });
  revalidateEventOS();
  redirect(`/competition/events/${registration.event.id}?tab=participants&saved=note#deltagere`);
}

export async function updateEventVehicleStatusAction(registrationId: string, status: "PENDING" | "APPROVED" | "REJECTED") {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    include: {
      event: { select: { id: true, title: true, usesVehicles: true, requiresVehicleApproval: true } },
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
  if (!registration.event.usesVehicles || !registration.event.requiresVehicleApproval) {
    throw new Error("Godkendelse af køretøjer er ikke aktiveret for dette event.");
  }

  const vehicle = registration.vehicle;

  await prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { status: status === "REJECTED" ? "SUSPENDED" : "ACTIVE" },
    });

    const latestInspection = vehicle.inspections[0];
    if (latestInspection) {
      await tx.vehicleInspection.update({
        where: { id: latestInspection.id },
        data: {
          status,
          inspectedById: status === "PENDING" ? null : user.id,
          inspectedAt: status === "PENDING" ? null : new Date(),
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

export async function updateEventVehicleNoteAction(registrationId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    include: {
      event: { select: { id: true, title: true, usesVehicles: true } },
      vehicle: { include: { inspections: { orderBy: { createdAt: "desc" }, take: 1 } } },
    },
  });
  if (!registration?.vehicle) throw new Error("Tilmeldingen har ikke et køretøj.");
  assertEventFeature(registration.event.usesVehicles, "Køretøjer er ikke aktiveret for dette event.");
  const inspection = registration.vehicle.inspections[0];
  if (!inspection) throw new Error("Køretøjet har ingen checklist, som noten kan gemmes på.");
  await prisma.vehicleInspection.update({ where: { id: inspection.id }, data: { notes: readNullableString(formData.get("internalNote")) } });
  await writeAuditLog({ actorId: user.id, action: "EVENT_VEHICLE_NOTE_UPDATED", target: `Vehicle:${registration.vehicle.id}`, details: { event: registration.event.title } });
  revalidateEventOS();
  redirect(`/competition/events/${registration.event.id}?tab=vehicles&saved=vehicles#køretøjer`);
}

export async function bulkUpdateEventVehiclesAction(eventId: string, status: "APPROVED" | "REJECTED", formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const registrationIds = formData.getAll("registrationIds").map(String).filter(Boolean);
  if (registrationIds.length === 0) throw new Error("Vælg mindst ét køretøj.");
  const registrations = await prisma.eventRegistration.findMany({
    where: { id: { in: registrationIds }, eventId, vehicleId: { not: null } },
    select: { id: true },
  });
  if (registrations.length !== registrationIds.length) throw new Error("Et eller flere valgte køretøjer er ugyldige.");
  for (const registration of registrations) await updateEventVehicleStatusAction(registration.id, status);
  await writeAuditLog({
    actorId: user.id,
    action: status === "APPROVED" ? "VEHICLES_BULK_APPROVED" : "VEHICLES_BULK_REJECTED",
    target: `Event:${eventId}`,
    details: { count: registrations.length },
  });
  revalidateEventOS();
  redirect(`/competition/events/${eventId}?tab=vehicles&saved=vehicles#køretøjer`);
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
      event: { select: { id: true, title: true, usesHeats: true } },
      participants: { select: { id: true, name: true, seed: true }, orderBy: [{ seed: "asc" }, { createdAt: "asc" }] },
      heats: { include: { entries: true } },
      results: { select: { id: true } },
    },
  });

  if (!competition) throw new Error("Konkurrencen findes ikke.");
  assertEventFeature(competition.event.usesHeats, "Køreliste / heats er ikke aktiveret for dette event.");
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

export async function unlockHeatsAction(competitionId: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: { event: { select: { id: true, title: true, usesHeats: true } }, heats: { select: { status: true } } },
  });
  if (!competition) throw new Error("Konkurrencen findes ikke.");
  assertEventFeature(competition.event.usesHeats, "Køreliste / heats er ikke aktiveret for dette event.");
  if (competition.heats.some((heat) => heat.status === "ACTIVE" || heat.status === "COMPLETED")) throw new Error("Startede eller afsluttede heats kan ikke låses op.");
  await prisma.heat.updateMany({ where: { competitionId }, data: { locked: false, status: "READY" } });
  await writeAuditLog({ actorId: user.id, action: "HEATS_UPDATED", target: `Competition:${competitionId}`, details: { event: competition.event.title, operation: "unlocked" } });
  revalidateEventOS();
  redirect(`/competition/events/${competition.event.id}?tab=heats&saved=heats#køreliste`);
}

export async function resetHeatsAction(competitionId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  if (formData.get("confirmReset") !== "on") throw new Error("Bekræft reset af kørelisten.");
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: { event: { select: { id: true, title: true, usesHeats: true } }, heats: true, results: { select: { id: true } } },
  });
  if (!competition) throw new Error("Konkurrencen findes ikke.");
  assertEventFeature(competition.event.usesHeats, "Køreliste / heats er ikke aktiveret for dette event.");
  if (competition.heats.some((heat) => heat.locked || heat.status === "ACTIVE" || heat.status === "COMPLETED")) throw new Error("Låste, startede eller afsluttede heats kan ikke nulstilles.");
  if (competition.results.length) throw new Error("Kørelisten kan ikke nulstilles, når der findes resultater.");
  await prisma.heat.deleteMany({ where: { competitionId } });
  await writeAuditLog({ actorId: user.id, action: "HEATS_RESET", target: `Competition:${competitionId}`, details: { event: competition.event.title } });
  revalidateEventOS();
  redirect(`/competition/events/${competition.event.id}?tab=heats&saved=heats#køreliste`);
}

export async function moveHeatEntryAction(entryId: string, direction: "up" | "down") {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const entry = await prisma.heatEntry.findUnique({
    where: { id: entryId },
    include: { heat: { include: { competition: { include: { event: { select: { id: true, title: true, usesHeats: true } } } } } } },
  });
  if (!entry) throw new Error("Deltageren findes ikke i kørelisten.");
  assertEventFeature(entry.heat.competition.event.usesHeats, "Køreliste / heats er ikke aktiveret for dette event.");
  if (entry.heat.locked) throw new Error("Kørelisten er låst.");
  const neighbour = await prisma.heatEntry.findFirst({
    where: { heatId: entry.heatId, startPosition: direction === "up" ? { lt: entry.startPosition } : { gt: entry.startPosition } },
    orderBy: { startPosition: direction === "up" ? "desc" : "asc" },
  });
  if (neighbour) {
    await prisma.$transaction([
      prisma.heatEntry.update({ where: { id: entry.id }, data: { startPosition: -1 } }),
      prisma.heatEntry.update({ where: { id: neighbour.id }, data: { startPosition: entry.startPosition } }),
      prisma.heatEntry.update({ where: { id: entry.id }, data: { startPosition: neighbour.startPosition } }),
    ]);
  }
  await writeAuditLog({ actorId: user.id, action: "HEATS_UPDATED", target: `Competition:${entry.heat.competitionId}`, details: { event: entry.heat.competition.event.title, operation: direction } });
  revalidateEventOS();
  redirect(`/competition/events/${entry.heat.competition.event.id}?tab=heats&saved=heats#køreliste`);
}

export async function moveHeatEntryToHeatAction(entryId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const targetHeatId = String(formData.get("targetHeatId") ?? "");
  const entry = await prisma.heatEntry.findUnique({ where: { id: entryId }, include: { heat: { include: { competition: { include: { event: true } } } } } });
  const target = await prisma.heat.findUnique({ where: { id: targetHeatId }, include: { entries: { orderBy: { startPosition: "desc" }, take: 1 } } });
  if (!entry || !target || target.competitionId !== entry.heat.competitionId) throw new Error("Det valgte heat er ugyldigt.");
  assertEventFeature(entry.heat.competition.event.usesHeats, "Køreliste / heats er ikke aktiveret for dette event.");
  if (entry.heat.locked || target.locked) throw new Error("Kørelisten er låst.");
  await prisma.heatEntry.update({ where: { id: entryId }, data: { heatId: target.id, startPosition: (target.entries[0]?.startPosition ?? 0) + 1 } });
  await writeAuditLog({ actorId: user.id, action: "HEATS_UPDATED", target: `Competition:${target.competitionId}`, details: { event: entry.heat.competition.event.title, operation: "moved-between-heats" } });
  revalidateEventOS();
  redirect(`/competition/events/${entry.heat.competition.event.id}?tab=heats&saved=heats#køreliste`);
}

export async function addHeatEntryAction(competitionId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const heatId = String(formData.get("heatId") ?? "");
  const participantId = String(formData.get("participantId") ?? "");
  const competition = await prisma.competition.findUnique({ where: { id: competitionId }, include: { event: true } });
  const heat = await prisma.heat.findFirst({ where: { id: heatId, competitionId }, include: { entries: { orderBy: { startPosition: "desc" }, take: 1 } } });
  const participant = await prisma.participant.findFirst({ where: { id: participantId, competitionId }, select: { id: true } });
  if (!competition || !heat || !participant) throw new Error("Heat eller deltager er ugyldig.");
  assertEventFeature(competition.event.usesHeats, "Køreliste / heats er ikke aktiveret for dette event.");
  if (heat.locked) throw new Error("Kørelisten er låst.");
  const existing = await prisma.heatEntry.findFirst({ where: { participantId, heat: { competitionId } } });
  if (existing) throw new Error("Deltageren findes allerede i kørelisten.");
  await prisma.heatEntry.create({ data: { heatId, participantId, startPosition: (heat.entries[0]?.startPosition ?? 0) + 1 } });
  await writeAuditLog({ actorId: user.id, action: "HEATS_UPDATED", target: `Competition:${competitionId}`, details: { event: competition.event.title, operation: "participant-added" } });
  revalidateEventOS();
  redirect(`/competition/events/${competition.event.id}?tab=heats&saved=heats#køreliste`);
}

export async function removeHeatEntryAction(entryId: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const entry = await prisma.heatEntry.findUnique({ where: { id: entryId }, include: { heat: { include: { competition: { include: { event: true } } } } } });
  if (!entry) throw new Error("Deltageren findes ikke i kørelisten.");
  assertEventFeature(entry.heat.competition.event.usesHeats, "Køreliste / heats er ikke aktiveret for dette event.");
  if (entry.heat.locked) throw new Error("Kørelisten er låst.");
  await prisma.heatEntry.delete({ where: { id: entryId } });
  await writeAuditLog({ actorId: user.id, action: "HEATS_UPDATED", target: `Competition:${entry.heat.competitionId}`, details: { event: entry.heat.competition.event.title, operation: "participant-removed" } });
  revalidateEventOS();
  redirect(`/competition/events/${entry.heat.competition.event.id}?tab=heats&saved=heats#køreliste`);
}

export async function deleteHeatAction(heatId: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const heat = await prisma.heat.findUnique({ where: { id: heatId }, include: { competition: { include: { event: true } } } });
  if (!heat) throw new Error("Heatet findes ikke.");
  assertEventFeature(heat.competition.event.usesHeats, "Køreliste / heats er ikke aktiveret for dette event.");
  if (heat.locked || heat.status === "ACTIVE" || heat.status === "COMPLETED") throw new Error("Heatet er låst eller startet.");
  await prisma.heat.delete({ where: { id: heatId } });
  await writeAuditLog({ actorId: user.id, action: "HEATS_UPDATED", target: `Competition:${heat.competitionId}`, details: { event: heat.competition.event.title, operation: "heat-deleted" } });
  revalidateEventOS();
  redirect(`/competition/events/${heat.competition.event.id}?tab=heats&saved=heats#køreliste`);
}

export async function generateBracketAction(competitionId: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: {
      event: { select: { id: true, title: true, usesBracket: true } },
      participants: { select: { id: true, name: true, seed: true }, orderBy: [{ seed: "asc" }, { createdAt: "asc" }] },
      brackets: { include: { matches: true } },
    },
  });

  if (!competition) throw new Error("Konkurrencen findes ikke.");
  assertEventFeature(competition.event.usesBracket, "Bracket er ikke aktiveret for dette event.");
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

  const existing = await prisma.bracketMatch.findUnique({
    where: { id: matchId },
    include: { bracket: { include: { competition: { include: { event: { select: { id: true, title: true, usesBracket: true } } } } } } },
  });
  if (!existing) throw new Error("Bracket-kampen findes ikke.");
  assertEventFeature(existing.bracket.competition.event.usesBracket, "Bracket er ikke aktiveret for dette event.");
  if (existing.bracket.locked) throw new Error("Bracket er låst.");
  if (winnerId !== existing.participantAId && winnerId !== existing.participantBId) throw new Error("Vinderen skal være deltager i kampen.");
  const match = await prisma.bracketMatch.update({
    where: { id: matchId },
    data: { winnerId, status: "COMPLETED", completedAt: new Date() },
    include: { bracket: { include: { competition: { include: { event: { select: { id: true, title: true } } } } } } },
  });
  const roundMatches = await prisma.bracketMatch.findMany({
    where: { bracketId: existing.bracketId, round: existing.round },
    orderBy: { matchNumber: "asc" },
  });
  if (roundMatches.length > 1 && roundMatches.every((roundMatch) => roundMatch.winnerId)) {
    if (existing.winnerId && existing.winnerId !== winnerId) {
      await prisma.bracketMatch.deleteMany({ where: { bracketId: existing.bracketId, round: { gt: existing.round + 1 } } });
    }
    for (let index = 0; index < roundMatches.length; index += 2) {
      await prisma.bracketMatch.upsert({
        where: { bracketId_round_matchNumber: { bracketId: existing.bracketId, round: existing.round + 1, matchNumber: index / 2 + 1 } },
        create: {
          bracketId: existing.bracketId,
          round: existing.round + 1,
          matchNumber: index / 2 + 1,
          participantAId: roundMatches[index].winnerId,
          participantBId: roundMatches[index + 1]?.winnerId ?? null,
        },
        update: {
          participantAId: roundMatches[index].winnerId,
          participantBId: roundMatches[index + 1]?.winnerId ?? null,
          winnerId: null,
          status: "PENDING",
          completedAt: null,
        },
      });
    }
  }

  await writeAuditLog({
    actorId: user.id,
    action: "BRACKET_WINNER_UPDATED",
    target: `BracketMatch:${matchId}`,
    details: { event: match.bracket.competition.event.title, winnerId },
  });

  revalidateEventOS();
  redirect(`/competition/events/${match.bracket.competition.event.id}?tab=bracket&saved=winner#bracket`);
}

export async function resetBracketAction(competitionId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  if (formData.get("confirmReset") !== "on") throw new Error("Bekræft reset af bracket.");
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: { event: { select: { id: true, title: true, usesBracket: true } }, brackets: true },
  });
  if (!competition) throw new Error("Konkurrencen findes ikke.");
  assertEventFeature(competition.event.usesBracket, "Bracket er ikke aktiveret for dette event.");
  if (competition.brackets.some((bracket) => bracket.locked)) throw new Error("Et låst bracket kan ikke nulstilles.");
  await prisma.bracket.deleteMany({ where: { competitionId } });
  await writeAuditLog({ actorId: user.id, action: "BRACKET_RESET", target: `Competition:${competitionId}`, details: { event: competition.event.title } });
  revalidateEventOS();
  redirect(`/competition/events/${competition.event.id}?tab=bracket&saved=bracket#bracket`);
}

export async function setBracketLockAction(competitionId: string, locked: boolean) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const competition = await prisma.competition.findUnique({ where: { id: competitionId }, include: { event: true, brackets: true } });
  if (!competition) throw new Error("Konkurrencen findes ikke.");
  assertEventFeature(competition.event.usesBracket, "Bracket er ikke aktiveret for dette event.");
  if (competition.brackets.length === 0) throw new Error("Der er intet bracket at låse.");
  await prisma.bracket.updateMany({ where: { competitionId }, data: { locked, status: locked ? "LOCKED" : "READY" } });
  await writeAuditLog({ actorId: user.id, action: locked ? "BRACKET_LOCKED" : "BRACKET_UNLOCKED", target: `Competition:${competitionId}`, details: { event: competition.event.title } });
  revalidateEventOS();
  redirect(`/competition/events/${competition.event.id}?tab=bracket&saved=bracket#bracket`);
}

export async function saveResultAction(competitionId: string, rowParticipantId: string | null, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const rows = parseResultRows(formData);
  const normalizedParticipantId = rowParticipantId?.trim() ?? "";
  const rowIndex = normalizedParticipantId ? rows.findIndex((row) => row.participantId === normalizedParticipantId) : 0;
  const row = rows[rowIndex];
  if (!row) throw new Error("Resultatrækken kunne ikke findes.");
  validateResultRow(row, rowIndex);

  const competition = await getCompetitionForResultSave(competitionId);
  const participant = competition.participants.find((candidate) => candidate.id === row.participantId);
  if (!participant) throw new Error("Deltageren tilhører ikke konkurrencen.");
  if (!isResultEligibleStatus(participant.status)) throw new Error("Kun godkendte eller checkede deltagere kan få nye resultater.");

  const existingResult = await prisma.result.findUnique({
    where: { competitionId_participantId: { competitionId, participantId: row.participantId } },
    select: { id: true, placement: true, points: true, finishTimeMs: true, reactionTimeMs: true, notes: true, status: true, locked: true },
  });

  if (!canMutateResultForEventStatus(competition.event.status, Boolean(existingResult))) {
    throw new Error("Nye resultater kan ikke oprettes på et afsluttet event. Eksisterende, ulåste resultater kan rettes.");
  }
  if (existingResult?.locked) throw new Error("Resultatet er låst og kan ikke ændres.");
  if (row.status === "APPROVED" && row.placementProvided && row.placement > 0) {
    const duplicatePlacement = await prisma.result.findFirst({ where: { competitionId, placement: row.placement, participantId: { not: row.participantId }, status: "APPROVED" } });
    if (duplicatePlacement) throw new Error(`Placering ${row.placement} er allerede tildelt en anden deltager.`);
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

  const nextSnapshot = resultHistorySnapshot(result);
  await writeAuditLog({
    actorId: user.id,
    action: existingResult ? "RESULT_UPDATED" : "RESULT_CREATED",
    target: `Result:${result.id}`,
    details: {
      eventId: competition.event.id,
      event: competition.event.title,
      competitionId,
      participantId: row.participantId,
      previous: resultHistorySnapshot(existingResult),
      next: nextSnapshot,
      changed: resultHistoryChanged(existingResult, result),
      prizeAssignmentsPreserved: true,
    },
  });

  revalidateEventOS(competition.event.id);
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
  validateResultRuleRows(rows);

  const participantIds = rows.map((row) => row.participantId);
  if (new Set(participantIds).size !== participantIds.length) {
    throw new Error("Samme deltager optræder flere gange i resultatlisten.");
  }

  const competition = await getCompetitionForResultSave(competitionId);
  const competitionParticipantIds = new Set(competition.participants.map((participant) => participant.id));
  if (participantIds.some((participantId) => !competitionParticipantIds.has(participantId))) throw new Error("En eller flere deltagere tilhører ikke konkurrencen.");
  if (competition.participants.some((participant) => participantIds.includes(participant.id) && !isResultEligibleStatus(participant.status))) throw new Error("Kun godkendte eller checkede deltagere kan få nye resultater.");
  const normalPlacements = rows.filter((row) => row.status === "APPROVED" && row.placementProvided && row.placement > 0).map((row) => row.placement);
  if (new Set(normalPlacements).size !== normalPlacements.length) throw new Error("To deltagere må ikke have samme placering.");
  const lockedResults = await prisma.result.findMany({
    where: { competitionId, participantId: { in: participantIds }, locked: true },
    select: { participantId: true },
  });

  if (lockedResults.length > 0) throw new Error("Et eller flere resultater er låst og kan ikke ændres.");

  const previousResults = await prisma.result.findMany({
    where: { competitionId, participantId: { in: participantIds } },
    select: { participantId: true, placement: true, points: true, finishTimeMs: true, reactionTimeMs: true, notes: true, status: true },
  });
  if (competition.event.status === "COMPLETED" && previousResults.length !== participantIds.length) {
    throw new Error("Nye resultater kan ikke oprettes på et afsluttet event. Eksisterende, ulåste resultater kan rettes.");
  }
  const previousByParticipant = new Map(previousResults.map((result) => [result.participantId, result]));

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
    details: {
      eventId: competition.event.id,
      event: competition.event.title,
      competitionId,
      results: rows.length,
      changes: rows.map((row) => ({ participantId: row.participantId, previous: resultHistorySnapshot(previousByParticipant.get(row.participantId)), next: resultHistorySnapshot(row) })),
      prizeAssignmentsPreserved: true,
    },
  });

  revalidateEventOS(competition.event.id);
  redirect(`/competition/events/${competition.event.id}?tab=results&saved=results#resultater`);
}

export async function lockCompetitionResultsAction(competitionId: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: { event: { select: { id: true, title: true, usesResults: true } }, results: { select: { id: true } } },
  });

  if (!competition) throw new Error("Konkurrencen findes ikke.");
  assertEventFeature(competition.event.usesResults, "Resultater er ikke aktiveret for dette event.");
  if (competition.results.length === 0) throw new Error("Der er ingen resultater at låse endnu.");

  await prisma.result.updateMany({
    where: { competitionId },
    data: { locked: true },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "RESULTS_LOCKED",
    target: `Competition:${competitionId}`,
    details: { eventId: competition.event.id, event: competition.event.title, competitionId, results: competition.results.length },
  });

  revalidateEventOS(competition.event.id);
  redirect(`/competition/events/${competition.event.id}?tab=results&saved=locked#resultater`);
}

export async function unlockCompetitionResultsAction(competitionId: string, formData: FormData) {
  const user = await requireCurrentUser();
  if (!canUnlockResults(user.role)) throw new Error("Kun Admin eller Super Admin kan låse resultater op.");
  if (formData.get("confirmUnlock") !== "on") throw new Error("Bekræft oplåsning af resultater.");
  const competition = await prisma.competition.findUnique({ where: { id: competitionId }, include: { event: { select: { id: true, title: true, usesResults: true } } } });
  if (!competition) throw new Error("Konkurrencen findes ikke.");
  assertEventFeature(competition.event.usesResults, "Resultater er ikke aktiveret for dette event.");
  await prisma.result.updateMany({ where: { competitionId }, data: { locked: false } });
  await writeAuditLog({ actorId: user.id, action: "RESULTS_UNLOCKED", target: `Competition:${competitionId}`, details: { eventId: competition.event.id, event: competition.event.title, competitionId } });
  revalidateEventOS(competition.event.id);
  redirect(`/competition/events/${competition.event.id}?tab=results&saved=unlocked#resultater`);
}

export async function createEventPrizeAction(eventId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const data = parsePrizeData(formData);
  const prize = await prisma.$transaction(async (transaction) => {
    const event = await transaction.event.findUnique({ where: { id: eventId }, select: { usesPrizes: true } });
    if (!event) throw new Error("Eventet findes ikke.");
    assertEventFeature(event.usesPrizes, "Præmier er ikke aktiveret for dette event.");

    const [placementCount, existingCount] = await Promise.all([
      data.placement === null
        ? Promise.resolve(0)
        : transaction.eventPrize.count({ where: { eventId, placement: data.placement } }),
      transaction.eventPrize.count({ where: { eventId } }),
    ]);
    assertPrizePartLimit(placementCount, data.placement);

    return transaction.eventPrize.create({
      data: {
        eventId,
        ...data,
        sortOrder: (existingCount + 1) * 10,
      },
      include: { event: { select: { title: true } } },
    });
  }, { isolationLevel: "Serializable" });

  await writeAuditLog({
    actorId: user.id,
    action: "PRIZE_CREATED",
    target: `EventPrize:${prize.id}`,
    details: { event: prize.event.title, prize: prize.title },
  });

  revalidateEventOS();
  revalidatePath(`/competition/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
  redirect(`/competition/events/${eventId}?tab=prizes&saved=prizes#præmier`);
}

export async function updateEventPrizeAction(prizeId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const data = parsePrizeData(formData);
  const existing = await getPrizeEvent(prizeId);

  const prize = await prisma.$transaction(async (transaction) => {
    if (data.placement !== null) {
      const placementCount = await transaction.eventPrize.count({
        where: { eventId: existing.eventId, placement: data.placement, id: { not: prizeId } },
      });
      assertPrizePartLimit(placementCount, data.placement);
    }
    return transaction.eventPrize.update({
      where: prizeIdentity(prizeId),
      data,
      include: { event: { select: { title: true } } },
    });
  }, { isolationLevel: "Serializable" });

  await writeAuditLog({
    actorId: user.id,
    action: "PRIZE_UPDATED",
    target: `EventPrize:${prize.id}`,
    details: { event: prize.event.title, prize: prize.title },
  });

  revalidateEventOS();
  revalidatePath(`/competition/events/${existing.eventId}`);
  revalidatePath(`/events/${existing.eventId}`);
  redirect(`/competition/events/${existing.eventId}?tab=prizes&saved=prizes#præmier`);
}

export async function deactivateEventPrizeAction(prizeId: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const existing = await getPrizeEvent(prizeId);

  await prisma.eventPrize.update({
    where: { id: prizeId },
    data: { active: false },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "EVENT_PRIZE_DEACTIVATED",
    target: `EventPrize:${prizeId}`,
    details: { event: existing.event.title, prize: existing.title },
  });

  revalidateEventOS();
  revalidatePath(`/competition/events/${existing.eventId}`);
  revalidatePath(`/events/${existing.eventId}`);
  redirect(`/competition/events/${existing.eventId}?tab=prizes&saved=prizes#præmier`);
}

export async function toggleEventPrizeVisibilityAction(prizeId: string, active: boolean) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const existing = await getPrizeEvent(prizeId);
  await prisma.eventPrize.update({ where: { id: prizeId }, data: { active } });
  await writeAuditLog({ actorId: user.id, action: "PRIZE_UPDATED", target: `EventPrize:${prizeId}`, details: { event: existing.event.title, visible: active } });
  revalidateEventOS();
  revalidatePath(`/events/${existing.eventId}`);
  redirect(`/competition/events/${existing.eventId}?tab=prizes&saved=prizes#præmier`);
}

export async function deleteEventPrizeAction(prizeId: string, formData: FormData) {
  const user = await requireCurrentUser();
  if (!canDeletePrize(user.role)) throw new Error("Kun Admin eller Super Admin kan slette præmier.");
  if (formData.get("confirmDelete") !== "on") throw new Error("Bekræft sletning af præmien.");
  const existing = await getPrizeEvent(prizeId);
  await prisma.eventPrize.delete({ where: { id: prizeId } });
  await writeAuditLog({ actorId: user.id, action: "PRIZE_DELETED", target: `EventPrize:${prizeId}`, details: { event: existing.event.title, prize: existing.title } });
  revalidateEventOS();
  revalidatePath(`/events/${existing.eventId}`);
  redirect(`/competition/events/${existing.eventId}?tab=prizes&saved=prizes#præmier`);
}

export async function moveEventPrizeAction(prizeId: string, direction: "up" | "down") {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const prize = await getPrizeEvent(prizeId);
  const prizes = await prisma.eventPrize.findMany({
    where: { eventId: prize.eventId },
    orderBy: [{ sortOrder: "asc" }, { placement: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const currentIndex = prizes.findIndex((item) => item.id === prizeId);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= prizes.length) {
    redirect(`/competition/events/${prize.eventId}?tab=prizes#præmier`);
  }

  const reordered = [...prizes];
  [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];

  await prisma.$transaction(
    reordered.map((item, index) =>
      prisma.eventPrize.update({
        where: { id: item.id },
        data: { sortOrder: (index + 1) * 10 },
      }),
    ),
  );

  await writeAuditLog({
    actorId: user.id,
    action: "PRIZES_REORDERED",
    target: `Event:${prize.eventId}`,
    details: { event: prize.event.title },
  });

  revalidateEventOS();
  revalidatePath(`/competition/events/${prize.eventId}`);
  revalidatePath(`/events/${prize.eventId}`);
  redirect(`/competition/events/${prize.eventId}?tab=prizes&saved=prizes#præmier`);
}

export async function assignEventPrizeWinnerAction(prizeId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const participantId = readNullableString(formData.get("participantId"));
  const note = readNullableString(formData.get("note"));
  const prize = await getPrizeEvent(prizeId);

  if (!participantId) throw new Error("Vælg en deltager som vinder.");

  const participant = await prisma.participant.findFirst({
    where: { id: participantId, competition: { eventId: prize.eventId } },
    select: { id: true, userId: true, name: true },
  });
  if (!participant) throw new Error("Deltageren findes ikke på dette event.");

  await prisma.eventPrizeWinner.upsert({
    where: { eventPrizeId_participantId: { eventPrizeId: prizeId, participantId } },
    update: { userId: participant.userId, note, awardedAt: new Date() },
    create: { eventPrizeId: prizeId, participantId, userId: participant.userId, note },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "PRIZE_ASSIGNED",
    target: `EventPrize:${prizeId}`,
    details: { event: prize.event.title, prize: prize.title, winner: participant.name },
  });

  revalidateEventOS();
  revalidatePath(`/competition/events/${prize.eventId}`);
  revalidatePath(`/events/${prize.eventId}`);
  redirect(`/competition/events/${prize.eventId}?tab=prizes&saved=winner#præmier`);
}

export async function unassignEventPrizeWinnerAction(winnerId: string) {
  const user = await requireCurrentUser();
  assertStaff(user.role);
  const winner = await prisma.eventPrizeWinner.findUnique({ where: { id: winnerId }, include: { prize: { include: { event: { select: { id: true, title: true } } } }, participant: { select: { name: true } } } });
  if (!winner) throw new Error("Præmietildelingen findes ikke.");
  await prisma.eventPrizeWinner.delete({ where: { id: winnerId } });
  await writeAuditLog({ actorId: user.id, action: "PRIZE_UNASSIGNED", target: `EventPrize:${winner.eventPrizeId}`, details: { event: winner.prize.event.title, winner: winner.participant?.name } });
  revalidateEventOS();
  revalidatePath(`/events/${winner.prize.event.id}`);
  redirect(`/competition/events/${winner.prize.event.id}?tab=prizes&saved=winner#præmier`);
}

export async function completeEventAction(eventId: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertStaff(user.role);

  if (formData.get("confirmComplete") !== "on") {
    throw new Error("Bekræft at eventet skal afsluttes.");
  }

  await syncApprovedParticipantsToCompetition(eventId);
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
  if (event.usesResults && event.competitions.length === 0) {
    throw new Error("Eventet har ingen konkurrencer og kan ikke afsluttes endnu.");
  }

  const missingResults = event.usesResults ? event.competitions.filter(
    (competition) => competition.participants.length > 0 && competition.results.length !== competition.participants.length,
  ) : [];
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
      imageFocusX: event.imageFocusX,
      imageFocusY: event.imageFocusY,
      location: event.location,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      registrationOpenAt: event.registrationOpenAt,
      registrationCloseAt: event.registrationCloseAt,
      maxParticipants: event.maxParticipants,
      usesParticipantRegistration: event.usesParticipantRegistration,
      usesVehicles: event.usesVehicles,
      requiresVehicleApproval: event.usesVehicles && event.requiresVehicleApproval,
      usesHeats: event.usesHeats,
      usesBracket: event.usesBracket,
      usesResults: event.usesResults,
      usesPrizes: event.usesPrizes,
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
  redirect(`/competition/events/${copy.id}?tab=overview#oversigt`);
}
