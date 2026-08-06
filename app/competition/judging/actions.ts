"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/admin/audit";
import { calculateCandidateTotals, calculateJudgingTotals, rankJudgingTotals, votingIsOpen } from "@/lib/events/judging";

function canManage(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "EVENT_MANAGER";
}

async function requireManagedEvent(eventId: string, role: string) {
  if (!canManage(role)) throw new Error("Du har ikke adgang til eventets bedømmelse.");
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) throw new Error("Eventet findes ikke.");
}

export async function assignJudgeAction(eventId: string, formData: FormData) {
  const actor = await requireCurrentUser();
  await requireManagedEvent(eventId, actor.role);
  const userId = String(formData.get("userId") ?? "");
  const judge = await prisma.user.findFirst({ where: { id: userId, role: "JUDGE", active: true }, select: { id: true } });
  if (!judge) throw new Error("Vælg en aktiv bruger med rollen Dommer.");
  await prisma.eventJudge.upsert({ where: { eventId_userId: { eventId, userId } }, create: { eventId, userId, assignedById: actor.id }, update: { active: true, assignedById: actor.id } });
  await writeAuditLog({ actorId: actor.id, action: "EVENT_JUDGE_ASSIGNED", target: `Event:${eventId}`, details: { judgeId: userId } });
  revalidatePath(`/competition/events/${eventId}`);
}

export async function removeJudgeAction(eventId: string, userId: string) {
  const actor = await requireCurrentUser();
  await requireManagedEvent(eventId, actor.role);
  await prisma.eventJudge.updateMany({ where: { eventId, userId }, data: { active: false } });
  await writeAuditLog({ actorId: actor.id, action: "EVENT_JUDGE_REMOVED", target: `Event:${eventId}`, details: { judgeId: userId } });
  revalidatePath(`/competition/events/${eventId}`);
}

export async function saveJudgeScoreAction(eventId: string, participantId: string, formData: FormData) {
  const judge = await requireCurrentUser();
  if (judge.role !== "JUDGE") throw new Error("Kun tildelte dommere kan gemme dommerpoint.");
  const points = Number(formData.get("points"));
  const note = String(formData.get("note") ?? "").trim();
  const submit = formData.get("intent") === "submit";
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { resultMethod: true, judgePointsMin: true, judgePointsMax: true, judgingLockedAt: true, resultsPublishedAt: true, judges: { where: { userId: judge.id, active: true }, select: { id: true } } },
  });
  if (!event || event.judges.length === 0) throw new Error("Du er ikke tildelt dette event.");
  if (!['JUDGE_POINTS', 'JUDGE_AND_PUBLIC_VOTE'].includes(event.resultMethod)) throw new Error("Eventet bruger ikke dommerbedømmelse.");
  if (event.judgingLockedAt || event.resultsPublishedAt) throw new Error("Dommerbedømmelsen er låst.");
  if (!Number.isInteger(points) || points < event.judgePointsMin || points > event.judgePointsMax) throw new Error(`Point skal være et helt tal mellem ${event.judgePointsMin} og ${event.judgePointsMax}.`);
  const participant = await prisma.participant.findFirst({ where: { id: participantId, competition: { eventId }, status: { in: ["APPROVED", "CHECKED_IN"] } }, select: { id: true, competitionId: true } });
  if (!participant) throw new Error("Deltageren er ikke godkendt til eventet.");
  const previous = await prisma.judgeScore.findUnique({ where: { eventId_participantId_judgeId: { eventId, participantId, judgeId: judge.id } }, select: { points: true, note: true, status: true } });
  await prisma.judgeScore.upsert({
    where: { eventId_participantId_judgeId: { eventId, participantId, judgeId: judge.id } },
    create: { eventId, competitionId: participant.competitionId, participantId, judgeId: judge.id, points, note: note || null, status: submit ? "SUBMITTED" : "DRAFT", submittedAt: submit ? new Date() : null },
    update: { points, note: note || null, status: submit ? "SUBMITTED" : "DRAFT", submittedAt: submit ? new Date() : null },
  });
  await writeAuditLog({ actorId: judge.id, action: previous ? "JUDGE_SCORE_UPDATED" : "JUDGE_SCORE_SAVED", target: `JudgeScore:${eventId}:${participantId}:${judge.id}`, details: { before: previous, after: { points, note: note || null, status: submit ? "SUBMITTED" : "DRAFT" } } });
  revalidatePath(`/competition/judging`);
  redirect(`/competition/judging?eventId=${eventId}&saved=1`);
}

function voteFeedback(eventId:string,type:"ok"|"error",message:string):never{redirect(`/events/${eventId}/vote?${type}=${encodeURIComponent(message)}`)}
async function voteContext(eventId:string,candidateId:string){const user=await requireCurrentUser(); const event=await prisma.event.findUnique({where:{id:eventId},select:{active:true,public:true,resultMethod:true,votingOpenAt:true,votingCloseAt:true,resultsPublishedAt:true,allowVoteChange:true}}); if(!event||!["PUBLIC_VOTE_ONLY","JUDGE_AND_PUBLIC_VOTE"].includes(event.resultMethod)||!votingIsOpen(event))voteFeedback(eventId,"error","Afstemningen er ikke åben."); const candidate=await prisma.voteCandidate.findFirst({where:{id:candidateId,eventId,active:true,public:true},select:{id:true,participantId:true,participant:{select:{competitionId:true}}}}); if(!candidate)voteFeedback(eventId,"error","Kandidaten er ikke aktiv eller findes ikke længere."); return {user,event,candidate};}
export async function castVoteAction(eventId:string,candidateId:string){const {user,candidate}=await voteContext(eventId,candidateId); const existing=await prisma.publicVote.findUnique({where:{eventId_userId:{eventId,userId:user.id}},select:{candidateId:true}}); if(existing&&existing.candidateId!==candidateId)voteFeedback(eventId,"error","Du har allerede stemt. Brug Skift stemme for at vælge en anden bil."); await prisma.publicVote.upsert({where:{eventId_userId:{eventId,userId:user.id}},create:{eventId,userId:user.id,candidateId,participantId:candidate.participantId,competitionId:candidate.participant?.competitionId??null},update:{candidateId,participantId:candidate.participantId,competitionId:candidate.participant?.competitionId??null}}); await writeAuditLog({actorId:user.id,action:"PUBLIC_VOTE_CAST",target:`Event:${eventId}`,details:{voteId:`${eventId}:${user.id}`}}); revalidatePath(`/events/${eventId}/vote`);voteFeedback(eventId,"ok","Din stemme er registreret.");}
export async function changeVoteAction(eventId:string,candidateId:string,formData:FormData){const {user,event,candidate}=await voteContext(eventId,candidateId);if(!event.allowVoteChange)voteFeedback(eventId,"error","Eventet tillader ikke ændring af stemmen.");if(formData.get("confirm")!=="change")voteFeedback(eventId,"error","Bekræft at du vil skifte stemme.");const existing=await prisma.publicVote.findUnique({where:{eventId_userId:{eventId,userId:user.id}},select:{id:true}});if(!existing)voteFeedback(eventId,"error","Du har ingen eksisterende stemme at ændre.");await prisma.publicVote.update({where:{id:existing.id},data:{candidateId,participantId:candidate.participantId,competitionId:candidate.participant?.competitionId??null}});await writeAuditLog({actorId:user.id,action:"PUBLIC_VOTE_CHANGED",target:`Event:${eventId}`,details:{voteId:`${eventId}:${user.id}`}});revalidatePath(`/events/${eventId}/vote`);voteFeedback(eventId,"ok","Din stemme blev ændret.");}
export async function withdrawVoteAction(eventId:string){const user=await requireCurrentUser();const event=await prisma.event.findUnique({where:{id:eventId},select:{active:true,public:true,resultMethod:true,votingOpenAt:true,votingCloseAt:true,resultsPublishedAt:true}});if(!event||!votingIsOpen(event))voteFeedback(eventId,"error","Stemmen kan ikke fortrydes, fordi afstemningen er lukket.");const removed=await prisma.publicVote.deleteMany({where:{eventId,userId:user.id}});if(!removed.count)voteFeedback(eventId,"error","Du har ingen stemme at fortryde.");await writeAuditLog({actorId:user.id,action:"PUBLIC_VOTE_WITHDRAWN",target:`Event:${eventId}`,details:{voteId:`${eventId}:${user.id}`}});revalidatePath(`/events/${eventId}/vote`);voteFeedback(eventId,"ok","Din stemme blev fortrudt.");}

export async function setVotingStateAction(eventId: string, state: "open" | "closed") {
  const actor = await requireCurrentUser();
  await requireManagedEvent(eventId, actor.role);
  await prisma.event.update({ where: { id: eventId }, data: state === "open" ? { votingOpenAt: new Date(), votingCloseAt: null, resultsPublishedAt: null } : { votingCloseAt: new Date() } });
  await writeAuditLog({ actorId: actor.id, action: state === "open" ? "PUBLIC_VOTING_OPENED" : "PUBLIC_VOTING_CLOSED", target: `Event:${eventId}` });
  revalidatePath(`/competition/events/${eventId}`);
  revalidatePath(`/events/${eventId}/vote`);
}

export async function publishJudgingResultsAction(eventId: string, formData: FormData) {
  const actor = await requireCurrentUser();
  await requireManagedEvent(eventId, actor.role);
  if (formData.get("confirm") !== "publish") throw new Error("Bekræft offentliggørelsen.");
  const event = await prisma.event.findUnique({ where: { id: eventId }, include: { competitions: { include: { participants: { where: { status: { in: ["APPROVED", "CHECKED_IN"] } } } } }, judgeScores: true, publicVotes: true, voteCandidates: { where: { active: true, public: true } } } });
  if (!event || !["JUDGE_POINTS", "JUDGE_AND_PUBLIC_VOTE", "PUBLIC_VOTE_ONLY"].includes(event.resultMethod)) throw new Error("Eventet kan ikke offentliggøre denne resultattype.");
  const useCandidates = event.resultMethod !== "JUDGE_POINTS";
  const candidateTotals = calculateCandidateTotals(event.voteCandidates, event.judgeScores, event.publicVotes, event.resultMethod);
  if (useCandidates && candidateTotals.some((total) => !total.participantId)) throw new Error("Alle synlige afstemningskandidater skal kobles til en Participant før offentliggørelse.");
  const totals = useCandidates ? candidateTotals.map((total) => ({ participantId: total.participantId!, judgePoints: total.judgePoints, judgeAverage: total.judgeAverage, submittedJudges: total.submittedJudges, publicVotes: total.publicVotes, finalPoints: total.finalPoints })) : calculateJudgingTotals(event.competitions.flatMap((competition) => competition.participants.map((participant) => participant.id)), event.judgeScores, event.publicVotes, event.resultMethod);
  const ranked = rankJudgingTotals(totals);
  if (ranked.unresolved.length) throw new Error("Der er pointlighed. Vælg placering manuelt før offentliggørelse.");
  const competitionByParticipant = new Map(event.competitions.flatMap((competition) => competition.participants.map((participant) => [participant.id, competition.id])));
  const publishedAt = new Date();
  await prisma.$transaction(async (tx) => {
    for (const [index, total] of ranked.sorted.entries()) {
      const competitionId = competitionByParticipant.get(total.participantId);
      if (!competitionId) continue;
      await tx.result.upsert({ where: { competitionId_participantId: { competitionId, participantId: total.participantId } }, create: { competitionId, participantId: total.participantId, placement: index + 1, points: total.finalPoints, locked: true, createdById: actor.id }, update: { placement: index + 1, points: total.finalPoints, locked: true, status: "APPROVED" } });
    }
    await tx.event.update({ where: { id: eventId }, data: { votingCloseAt: publishedAt, judgingLockedAt: publishedAt, resultsPublishedAt: publishedAt } });
  });
  await writeAuditLog({ actorId: actor.id, action: "RESULTS_PUBLISHED", target: `Event:${eventId}`, details: { participantCount: totals.length, publishedAt: publishedAt.toISOString() } });
  for (const path of [`/events/${eventId}`, `/events/${eventId}/vote`, `/competition/events/${eventId}`, "/competition/results", "/competition/leaderboard", "/hall-of-fame", "/competition/live-center"]) revalidatePath(path);
  redirect(`/competition/events/${eventId}?tab=results&published=1#resultater`);
}
