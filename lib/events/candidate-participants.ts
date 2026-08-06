import type { Prisma } from "@prisma/client";

type Transaction = Prisma.TransactionClient;

export const CANDIDATE_RESULT_METHODS = ["PUBLIC_VOTE_ONLY", "JUDGE_AND_PUBLIC_VOTE", "JUDGE_POINTS"] as const;

export function usesVoteCandidatesAsResultSource(resultMethod: string) {
  return CANDIDATE_RESULT_METHODS.includes(resultMethod as (typeof CANDIDATE_RESULT_METHODS)[number]);
}

export async function ensureVoteCandidateParticipant(transaction: Transaction, eventId: string, candidateId: string) {
  await transaction.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtext(${eventId}))`;
  const candidate = await transaction.voteCandidate.findFirst({ where: { id: candidateId, eventId }, select: { id: true, participantId: true } });
  if (!candidate) throw new Error("Afstemningskandidaten findes ikke.");
  if (candidate.participantId) return candidate.participantId;
  const event = await transaction.event.findUnique({ where: { id: eventId }, select: { title: true, competitions: { orderBy: { createdAt: "asc" }, take: 1, select: { id: true } } } });
  if (!event) throw new Error("Eventet findes ikke.");
  const competition = event.competitions[0] ?? await transaction.competition.create({ data: { eventId, title: "Hovedkonkurrence", type: "OTHER", description: `Standardkonkurrence for ${event.title}` }, select: { id: true } });
  const participant = await transaction.participant.create({ data: { competitionId: competition.id, name: `Afstemningskandidat ${candidate.id.slice(-6)}`, status: "APPROVED" }, select: { id: true } });
  await transaction.voteCandidate.update({ where: { id: candidate.id }, data: { participantId: participant.id } });
  return participant.id;
}

export async function ensureAllVoteCandidateParticipants(transaction: Transaction, eventId: string) {
  const candidates = await transaction.voteCandidate.findMany({ where: { eventId, active: true, public: true }, select: { id: true } });
  for (const candidate of candidates) await ensureVoteCandidateParticipant(transaction, eventId, candidate.id);
  return candidates.length;
}
