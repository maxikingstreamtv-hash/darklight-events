export const RESULT_ELIGIBLE_STATUSES = ["APPROVED", "CHECKED_IN"] as const;

export function isResultEligibleStatus(status: string) {
  return RESULT_ELIGIBLE_STATUSES.some((eligible) => eligible === status);
}

export function shouldCreateDefaultCompetition(usesResults: boolean, existingCompetitionCount: number) {
  return usesResults && existingCompetitionCount === 0;
}

export function getResultProgress(competitions: Array<{
  participants: Array<{ id: string; status: string }>;
  results: Array<{ participantId: string }>;
}>, options?: { resultMethod?: string; usesParticipantRegistration?: boolean; candidateCount?: number; candidateParticipantIds?: string[] }) {
  const candidatesAreSource = ["PUBLIC_VOTE_ONLY", "JUDGE_AND_PUBLIC_VOTE", "JUDGE_POINTS"].includes(options?.resultMethod ?? "");
  const eligibleIds = new Set(competitions.flatMap((competition) =>
    competition.participants.filter((participant) => isResultEligibleStatus(participant.status)).map((participant) => participant.id),
  ));
  const resultEligibleIds = candidatesAreSource ? new Set(options?.candidateParticipantIds ?? []) : eligibleIds;
  const completedIds = new Set(competitions.flatMap((competition) =>
    competition.results.filter((result) => resultEligibleIds.has(result.participantId)).map((result) => result.participantId),
  ));
  const readyParticipants = candidatesAreSource ? options?.candidateCount ?? 0 : eligibleIds.size;
  return {
    readyParticipants,
    completedResults: completedIds.size,
    missingResults: Math.max(readyParticipants - completedIds.size, 0),
    hasParticipants: readyParticipants > 0,
    complete: readyParticipants > 0 && completedIds.size === readyParticipants,
    source: candidatesAreSource ? "candidates" as const : "participants" as const,
  };
}

export async function ensureDefaultCompetitionForEvent(eventId: string) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtext(${eventId}))`;
    const event = await transaction.event.findUnique({
      where: { id: eventId },
      select: {
        title: true,
        usesResults: true,
        competitions: { orderBy: { createdAt: "asc" }, take: 1, select: { id: true, title: true } },
      },
    });
    if (!event) throw new Error("Eventet findes ikke.");
    if (!event.usesResults) return { competition: null, created: false };
    if (event.competitions[0]) return { competition: event.competitions[0], created: false };

    const competition = await transaction.competition.create({
      data: {
        eventId,
        title: "Hovedkonkurrence",
        type: "OTHER",
        description: `Standardkonkurrence for ${event.title}`,
      },
      select: { id: true, title: true },
    });
    return { competition, created: true };
  });
}

export async function syncApprovedParticipantsToCompetition(eventId: string) {
  const { prisma } = await import("@/lib/prisma");
  const eventFeatures = await prisma.event.findUnique({ where: { id: eventId }, select: { usesParticipantRegistration: true } });
  if (!eventFeatures) throw new Error("Eventet findes ikke.");
  const ensured = await ensureDefaultCompetitionForEvent(eventId);
  if (!ensured.competition) return { competitionId: null, createdCompetition: false, synced: 0, removed: 0, preservedWithResults: 0 };
  const competitionId = ensured.competition.id;
  if (!eventFeatures.usesParticipantRegistration) return { competitionId, createdCompetition: ensured.created, synced: 0, removed: 0, preservedWithResults: 0 };

  const result = await prisma.$transaction(async (transaction) => {
    const registrations = await transaction.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, displayName: true } },
        vehicle: { select: { displayName: true } },
      },
    });
    const participants = await transaction.participant.findMany({
      where: { competitionId, registrationId: { not: null } },
      include: { _count: { select: { results: true } } },
    });
    const activeRegistrations = registrations.filter((registration) => isResultEligibleStatus(registration.status));

    for (const registration of activeRegistrations) {
      await transaction.participant.upsert({
        where: { competitionId_userId: { competitionId, userId: registration.userId } },
        update: {
          registrationId: registration.id,
          name: registration.user.displayName,
          vehicle: registration.vehicle?.displayName ?? null,
          number: registration.competitionNumber,
          checkedInAt: registration.status === "CHECKED_IN" ? registration.checkedInAt ?? new Date() : null,
          status: registration.status,
        },
        create: {
          competitionId,
          userId: registration.userId,
          registrationId: registration.id,
          name: registration.user.displayName,
          vehicle: registration.vehicle?.displayName ?? null,
          number: registration.competitionNumber,
          checkedInAt: registration.status === "CHECKED_IN" ? registration.checkedInAt ?? new Date() : null,
          status: registration.status,
        },
      });
    }

    const registrationsById = new Map(registrations.map((registration) => [registration.id, registration]));
    let removed = 0;
    let preservedWithResults = 0;
    for (const participant of participants) {
      const registration = participant.registrationId ? registrationsById.get(participant.registrationId) : null;
      if (registration && isResultEligibleStatus(registration.status)) continue;
      if (participant._count.results === 0) {
        await transaction.participant.delete({ where: { id: participant.id } });
        removed += 1;
      } else {
        await transaction.participant.update({
          where: { id: participant.id },
          data: { status: registration?.status ?? "CANCELLED" },
        });
        preservedWithResults += 1;
      }
    }

    return { synced: activeRegistrations.length, removed, preservedWithResults };
  });

  return { competitionId, createdCompetition: ensured.created, ...result };
}
