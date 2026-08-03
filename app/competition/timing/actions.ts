"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, type ResultStatus } from "@prisma/client";
import { requireCurrentUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/admin/audit";
import { prisma } from "@/lib/prisma";
import { parseResultTime } from "@/lib/events/result-time";
import { syncApprovedParticipantsToCompetition } from "@/lib/events/result-sync";
import { buildTimingResultRows, calculateElapsedMs, canManageTiming, canReopenTiming, isTerminalTimingStatus, timingActiveKey } from "@/lib/timing/timing";

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

async function requireTimingStaff() {
  const user = await requireCurrentUser();
  if (!canManageTiming(user.role)) redirect("/forbidden");
  return user;
}

function timingPath(eventId: string, kind?: "ok" | "error", message?: string) {
  const query = new URLSearchParams({ eventId });
  if (kind && message) query.set(kind, message);
  return `/competition/timing?${query.toString()}#timing-panel`;
}

function revalidateTiming(eventId: string) {
  for (const path of ["/competition/timing", `/competition/events/${eventId}`, `/events/${eventId}`, "/rangliste", "/hall-of-fame", "/live-resultater", "/competition/live-center", "/competition/results", "/dashboard"]) revalidatePath(path);
}

async function completeTimingAction(eventId: string, operation: () => Promise<string>) {
  let kind: "ok" | "error" = "ok";
  let message: string;
  try {
    message = await operation();
  } catch (error) {
    kind = "error";
    message = error instanceof Prisma.PrismaClientKnownRequestError
      ? "Handlingen kunne ikke gennemføres på grund af en databasekonflikt. Opdatér siden og prøv igen."
      : error instanceof Error ? error.message : "Handlingen kunne ikke gennemføres.";
  }
  revalidateTiming(eventId);
  redirect(timingPath(eventId, kind, message));
}

async function getSessionContext(sessionId: string) {
  const session = await prisma.timingSession.findUnique({ where: { id: sessionId }, select: { id: true, eventId: true, competitionId: true, status: true } });
  if (!session) throw new Error("Tidtagningssessionen findes ikke.");
  return session;
}

export async function createTimingSessionAction(eventId: string) {
  const user = await requireTimingStaff();
  return completeTimingAction(eventId, async () => {
    const sync = await syncApprovedParticipantsToCompetition(eventId);
    if (!sync.competitionId) throw new Error("Eventet bruger ikke resultater.");
    const session = await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtext(${timingActiveKey(eventId, sync.competitionId!)}))`;
      const event = await transaction.event.findUnique({ where: { id: eventId }, select: { id: true, title: true, active: true, status: true, usesResults: true } });
      if (!event || !event.active || !event.usesResults) throw new Error("Eventet er ikke tilgængeligt for tidstagning.");
      if (event.status === "CANCELLED" || event.status === "ARCHIVED") throw new Error("Tidtagningssession kan ikke oprettes på et aflyst eller arkiveret event.");
      const existing = await transaction.timingSession.findUnique({ where: { activeKey: timingActiveKey(eventId, sync.competitionId!) }, select: { id: true } });
      if (existing) throw new Error("Der findes allerede en aktiv tidtagningssession for eventet.");
      const participants = await transaction.participant.findMany({ where: { competitionId: sync.competitionId!, status: { in: ["APPROVED", "CHECKED_IN"] } }, orderBy: [{ number: "asc" }, { name: "asc" }], select: { id: true } });
      if (participants.length === 0) throw new Error("Der er ingen godkendte eller checkede deltagere.");
      return transaction.timingSession.create({
        data: {
          eventId,
          competitionId: sync.competitionId!,
          activeKey: timingActiveKey(eventId, sync.competitionId!),
          createdById: user.id,
          entries: { create: participants.map((participant) => ({ participantId: participant.id })) },
        },
        select: { id: true, competitionId: true },
      });
    }, { isolationLevel: "Serializable" });
    await writeAuditLog({ actorId: user.id, action: "TIMING_SESSION_CREATED", target: `TimingSession:${session.id}`, details: { eventId, competitionId: session.competitionId, sessionId: session.id } });
    return "Tidtagningssessionen er klar.";
  });
}

export async function startTimingSessionAction(sessionId: string, data: FormData) {
  const user = await requireTimingStaff();
  const context = await getSessionContext(sessionId);
  return completeTimingAction(context.eventId, async () => {
    if (data.get("confirmStart") !== "on") throw new Error("Bekræft at tiden skal startes for alle deltagere.");
    const startedAt = new Date();
    const result = await prisma.$transaction(async (transaction) => {
      const changed = await transaction.timingSession.updateMany({ where: { id: sessionId, status: "READY", startedAt: null }, data: { status: "RUNNING", startedAt } });
      if (changed.count !== 1) throw new Error("Tidtagningssessionen er allerede startet eller kan ikke startes.");
      const entries = await transaction.timingEntry.updateMany({ where: { timingSessionId: sessionId, status: "READY" }, data: { status: "RUNNING", startedAt } });
      if (entries.count === 0) throw new Error("Sessionen har ingen deltagere, der kan startes.");
      return entries.count;
    }, { isolationLevel: "Serializable" });
    await writeAuditLog({ actorId: user.id, action: "TIMING_STARTED", target: `TimingSession:${sessionId}`, details: { eventId: context.eventId, competitionId: context.competitionId, sessionId, startedAt: startedAt.toISOString(), participants: result } });
    return `Tiden er startet samtidigt for ${result} deltagere.`;
  });
}

export async function addParticipantToTimingSessionAction(sessionId: string, data: FormData) {
  const user = await requireTimingStaff();
  const context = await getSessionContext(sessionId);
  return completeTimingAction(context.eventId, async () => {
    const participantId = text(data, "participantId");
    if (!participantId) throw new Error("Vælg en deltager.");
    const entry = await prisma.$transaction(async (transaction) => {
      const session = await transaction.timingSession.findUnique({ where: { id: sessionId }, select: { status: true, startedAt: true, competitionId: true, resultsTransferredAt: true } });
      if (!session || session.resultsTransferredAt || (session.status !== "READY" && session.status !== "RUNNING")) throw new Error("Der kan ikke tilføjes deltagere til denne session.");
      const participant = await transaction.participant.findFirst({ where: { id: participantId, competitionId: session.competitionId, status: { in: ["APPROVED", "CHECKED_IN"] } }, select: { id: true } });
      if (!participant) throw new Error("Deltageren er ikke godkendt til eventets resultatgrundlag.");
      return transaction.timingEntry.create({ data: { timingSessionId: sessionId, participantId, status: session.status === "RUNNING" ? "RUNNING" : "READY", startedAt: session.status === "RUNNING" ? session.startedAt : null }, select: { id: true } });
    }, { isolationLevel: "Serializable" }).catch((error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new Error("Deltageren findes allerede i sessionen.");
      throw error;
    });
    await writeAuditLog({ actorId: user.id, action: "TIMING_STATUS_CHANGED", target: `TimingEntry:${entry.id}`, details: { eventId: context.eventId, competitionId: context.competitionId, sessionId, participantId, previous: null, next: "ADDED_TO_SESSION" } });
    return "Deltageren er føjet til tidtagningen.";
  });
}

export async function stopTimingEntryAction(entryId: string) {
  const user = await requireTimingStaff();
  const entryContext = await prisma.timingEntry.findUnique({ where: { id: entryId }, select: { timingSession: { select: { id: true, eventId: true, competitionId: true } } } });
  if (!entryContext) redirect("/competition/timing?error=Tidtagningen%20findes%20ikke");
  const context = entryContext.timingSession;
  return completeTimingAction(context.eventId, async () => {
    const stoppedAt = new Date();
    const stopped = await prisma.$transaction(async (transaction) => {
      const entry = await transaction.timingEntry.findUnique({ where: { id: entryId }, select: { participantId: true, status: true, startedAt: true, timingSession: { select: { status: true, resultsTransferredAt: true } } } });
      if (!entry || !entry.startedAt || entry.timingSession.resultsTransferredAt || entry.timingSession.status !== "RUNNING") throw new Error("Tidtagningssessionen kører ikke eller er allerede overført.");
      const elapsedMs = calculateElapsedMs(entry.startedAt, stoppedAt);
      const changed = await transaction.timingEntry.updateMany({ where: { id: entryId, status: "RUNNING", stoppedAt: null }, data: { status: "FINISHED", stoppedAt, elapsedMs, stoppedById: user.id } });
      if (changed.count !== 1) throw new Error("Deltagerens tid er allerede stoppet.");
      return { participantId: entry.participantId, elapsedMs };
    }, { isolationLevel: "Serializable" });
    await writeAuditLog({ actorId: user.id, action: "TIMING_PARTICIPANT_STOPPED", target: `TimingEntry:${entryId}`, details: { eventId: context.eventId, competitionId: context.competitionId, sessionId: context.id, participantId: stopped.participantId, stoppedAt: stoppedAt.toISOString(), elapsedMs: stopped.elapsedMs } });
    return "Deltagerens tid er stoppet.";
  });
}

export async function setTimingEntryStatusAction(entryId: string, status: "DNF" | "DNS" | "DISQUALIFIED", data: FormData) {
  const user = await requireTimingStaff();
  const context = await prisma.timingEntry.findUnique({ where: { id: entryId }, select: { timingSession: { select: { id: true, eventId: true, competitionId: true } } } });
  if (!context) redirect("/competition/timing?error=Tidtagningen%20findes%20ikke");
  return completeTimingAction(context.timingSession.eventId, async () => {
    const note = text(data, "note");
    if (status === "DISQUALIFIED" && (data.get("confirmDisqualified") !== "on" || !note)) throw new Error("Bekræft diskvalifikation og angiv en begrundelse.");
    const now = new Date();
    const updated = await prisma.$transaction(async (transaction) => {
      const entry = await transaction.timingEntry.findUnique({ where: { id: entryId }, select: { participantId: true, status: true, timingSession: { select: { status: true, resultsTransferredAt: true } } } });
      if (!entry || entry.timingSession.resultsTransferredAt || entry.timingSession.status === "FINISHED" || entry.timingSession.status === "CANCELLED") throw new Error("En afsluttet eller overført tidtagningssession kan ikke ændres.");
      if (status === "DNS" && entry.status !== "READY" && entry.status !== "RUNNING") throw new Error("DNS kan kun vælges før eller under en aktiv start.");
      if (status === "DNF" && entry.status !== "RUNNING") throw new Error("DNF kan kun vælges for en deltager, der kører.");
      if (status === "DISQUALIFIED" && entry.status !== "READY" && entry.status !== "RUNNING" && entry.status !== "FINISHED") throw new Error("Deltagerens status kan ikke ændres til diskvalificeret.");
      const changed = await transaction.timingEntry.updateMany({ where: { id: entryId, status: entry.status }, data: { status, stoppedAt: entry.status === "RUNNING" ? now : null, elapsedMs: null, stoppedById: user.id, note: note || null } });
      if (changed.count !== 1) throw new Error("Deltagerens status blev ændret af en anden administrator. Prøv igen.");
      return { participantId: entry.participantId, previous: entry.status };
    }, { isolationLevel: "Serializable" });
    await writeAuditLog({ actorId: user.id, action: "TIMING_STATUS_CHANGED", target: `TimingEntry:${entryId}`, details: { eventId: context.timingSession.eventId, competitionId: context.timingSession.competitionId, sessionId: context.timingSession.id, participantId: updated.participantId, previous: updated.previous, next: status, note: note || null } });
    return `Deltageren er markeret som ${status}.`;
  });
}

export async function reopenTimingEntryAction(entryId: string, data: FormData) {
  const user = await requireTimingStaff();
  const context = await prisma.timingEntry.findUnique({ where: { id: entryId }, select: { timingSession: { select: { id: true, eventId: true, competitionId: true } } } });
  if (!context) redirect("/competition/timing?error=Tidtagningen%20findes%20ikke");
  return completeTimingAction(context.timingSession.eventId, async () => {
    if (data.get("confirmReopen") !== "on") throw new Error("Bekræft at deltagerens stop eller status skal fortrydes.");
    const changed = await prisma.$transaction(async (transaction) => {
      const entry = await transaction.timingEntry.findUnique({ where: { id: entryId }, select: { participantId: true, status: true, elapsedMs: true, timingSession: { select: { status: true, startedAt: true, resultsTransferredAt: true } } } });
      if (!entry || entry.timingSession.resultsTransferredAt || (entry.timingSession.status !== "READY" && entry.timingSession.status !== "RUNNING")) throw new Error("Sessionen kan ikke ændres efter overførsel eller afslutning.");
      if (entry.status === "READY" || entry.status === "RUNNING") throw new Error("Deltageren er allerede aktiv.");
      const next = entry.timingSession.status === "RUNNING" ? "RUNNING" : "READY";
      await transaction.timingEntry.update({ where: { id: entryId }, data: { status: next, startedAt: entry.timingSession.startedAt, stoppedAt: null, elapsedMs: null, stoppedById: null, manuallyAdjusted: false, note: null } });
      return { participantId: entry.participantId, previous: { status: entry.status, elapsedMs: entry.elapsedMs }, next };
    }, { isolationLevel: "Serializable" });
    await writeAuditLog({ actorId: user.id, action: "TIMING_PARTICIPANT_REOPENED", target: `TimingEntry:${entryId}`, details: { eventId: context.timingSession.eventId, competitionId: context.timingSession.competitionId, sessionId: context.timingSession.id, participantId: changed.participantId, previous: changed.previous, next: { status: changed.next, elapsedMs: null } } });
    return "Deltagerens timing er genåbnet.";
  });
}

export async function correctTimingEntryAction(entryId: string, data: FormData) {
  const user = await requireTimingStaff();
  const context = await prisma.timingEntry.findUnique({ where: { id: entryId }, select: { timingSession: { select: { id: true, eventId: true, competitionId: true } } } });
  if (!context) redirect("/competition/timing?error=Tidtagningen%20findes%20ikke");
  return completeTimingAction(context.timingSession.eventId, async () => {
    const note = text(data, "note");
    if (!note) throw new Error("Angiv en begrundelse for den manuelle tidsrettelse.");
    const elapsedMs = parseResultTime(text(data, "elapsed"));
    if (elapsedMs == null) throw new Error("Indtast en gyldig rettet tid.");
    const changed = await prisma.$transaction(async (transaction) => {
      const entry = await transaction.timingEntry.findUnique({ where: { id: entryId }, select: { participantId: true, status: true, elapsedMs: true, timingSession: { select: { status: true, resultsTransferredAt: true } } } });
      if (!entry || entry.status !== "FINISHED" || entry.timingSession.resultsTransferredAt || entry.timingSession.status === "FINISHED" || entry.timingSession.status === "CANCELLED") throw new Error("Kun en færdig tid i en aktiv, ikke-overført session kan rettes.");
      await transaction.timingEntry.update({ where: { id: entryId }, data: { elapsedMs, manuallyAdjusted: true, note, stoppedById: user.id } });
      return { participantId: entry.participantId, previous: entry.elapsedMs };
    });
    await writeAuditLog({ actorId: user.id, action: "TIMING_TIME_CORRECTED", target: `TimingEntry:${entryId}`, details: { eventId: context.timingSession.eventId, competitionId: context.timingSession.competitionId, sessionId: context.timingSession.id, participantId: changed.participantId, previous: { elapsedMs: changed.previous }, next: { elapsedMs }, reason: note } });
    return "Tiden er rettet.";
  });
}

export async function transferTimingResultsAction(sessionId: string, data: FormData) {
  const user = await requireTimingStaff();
  const context = await getSessionContext(sessionId);
  return completeTimingAction(context.eventId, async () => {
    const confirmOverwrite = data.get("confirmOverwrite") === "on";
    const transferredAt = new Date();
    const transfer = await prisma.$transaction(async (transaction) => {
      const session = await transaction.timingSession.findUnique({ where: { id: sessionId }, include: { entries: { orderBy: { participantId: "asc" } } } });
      if (!session || (session.status !== "RUNNING" && session.status !== "READY")) throw new Error("Sessionen kan ikke overføres.");
      if (session.resultsTransferredAt) throw new Error("Sessionens resultater er allerede overført.");
      if (session.entries.length === 0 || !session.entries.every((entry) => isTerminalTimingStatus(entry.status))) throw new Error("Alle deltagere skal have en slutstatus før overførsel.");
      const existing = await transaction.result.findMany({ where: { competitionId: session.competitionId, participantId: { in: session.entries.map((entry) => entry.participantId) } }, select: { id: true, participantId: true, placement: true, finishTimeMs: true, points: true, reactionTimeMs: true, status: true, notes: true, locked: true } });
      if (existing.some((result) => result.locked)) throw new Error("Et eller flere eksisterende resultater er låst.");
      if (existing.length > 0 && !confirmOverwrite) throw new Error("Der findes allerede resultater. Bekræft overskrivning for at fortsætte.");
      const previous = new Map(existing.map((result) => [result.participantId, result]));
      const changes = [];
      for (const row of buildTimingResultRows(session.entries)) {
        const old = previous.get(row.participantId);
        const status: ResultStatus = row.status;
        const next = { placement: row.placement, finishTimeMs: row.finishTimeMs, points: old?.points ?? null, reactionTimeMs: old?.reactionTimeMs ?? null, status, notes: row.notes ?? old?.notes ?? null };
        const result = await transaction.result.upsert({ where: { competitionId_participantId: { competitionId: session.competitionId, participantId: row.participantId } }, update: { ...next, createdById: user.id }, create: { competitionId: session.competitionId, participantId: row.participantId, ...next, createdById: user.id } });
        changes.push({ participantId: row.participantId, resultId: result.id, previous: old ?? null, next });
      }
      await transaction.timingSession.update({ where: { id: sessionId }, data: { resultsTransferredAt: transferredAt } });
      await transaction.auditLog.create({ data: { actorId: user.id, action: "TIMING_RESULTS_TRANSFERRED", target: `TimingSession:${sessionId}`, details: JSON.stringify({ eventId: session.eventId, competitionId: session.competitionId, sessionId, transferredAt: transferredAt.toISOString(), changes }) } });
      return { count: changes.length };
    }, { isolationLevel: "Serializable" });
    return `${transfer.count} resultater er overført.`;
  });
}

export async function finishTimingSessionAction(sessionId: string) {
  const user = await requireTimingStaff();
  const context = await getSessionContext(sessionId);
  return completeTimingAction(context.eventId, async () => {
    const finishedAt = new Date();
    const changed = await prisma.timingSession.updateMany({ where: { id: sessionId, status: { in: ["READY", "RUNNING"] }, resultsTransferredAt: { not: null } }, data: { status: "FINISHED", finishedAt, activeKey: null } });
    if (changed.count !== 1) throw new Error("Sessionen skal have overførte resultater, før den kan afsluttes.");
    await writeAuditLog({ actorId: user.id, action: "TIMING_SESSION_FINISHED", target: `TimingSession:${sessionId}`, details: { eventId: context.eventId, competitionId: context.competitionId, sessionId, finishedAt: finishedAt.toISOString() } });
    return "Tidtagningen er afsluttet og låst.";
  });
}

export async function reopenTimingSessionAction(sessionId: string, data: FormData) {
  const user = await requireTimingStaff();
  const context = await getSessionContext(sessionId);
  return completeTimingAction(context.eventId, async () => {
    if (!canReopenTiming(user.role)) throw new Error("Kun Super Admin og Admin kan genåbne en session.");
    if (data.get("confirmReopen") !== "on") throw new Error("Bekræft genåbning af tidtagningssessionen.");
    await prisma.timingSession.update({ where: { id: sessionId }, data: { status: "RUNNING", finishedAt: null, resultsTransferredAt: null, activeKey: timingActiveKey(context.eventId, context.competitionId) } });
    await writeAuditLog({ actorId: user.id, action: "TIMING_SESSION_REOPENED", target: `TimingSession:${sessionId}`, details: { eventId: context.eventId, competitionId: context.competitionId, sessionId, previous: "FINISHED", next: "RUNNING" } });
    return "Tidtagningssessionen er genåbnet.";
  });
}

export async function cancelTimingSessionAction(sessionId: string, data: FormData) {
  const user = await requireTimingStaff();
  const context = await getSessionContext(sessionId);
  return completeTimingAction(context.eventId, async () => {
    const reason = text(data, "reason");
    if (data.get("confirmCancel") !== "on" || !reason) throw new Error("Bekræft annullering og angiv en begrundelse.");
    const changed = await prisma.timingSession.updateMany({ where: { id: sessionId, status: { in: ["READY", "RUNNING"] }, resultsTransferredAt: null }, data: { status: "CANCELLED", finishedAt: new Date(), activeKey: null } });
    if (changed.count !== 1) throw new Error("Sessionen kan ikke annulleres efter resultatoverførsel.");
    await writeAuditLog({ actorId: user.id, action: "TIMING_SESSION_CANCELLED", target: `TimingSession:${sessionId}`, details: { eventId: context.eventId, competitionId: context.competitionId, sessionId, reason } });
    return "Tidtagningen er annulleret. Timingdata er bevaret.";
  });
}
