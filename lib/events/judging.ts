import type { EventResultMethodValue } from "./result-methods";

export type ScoreSource = { participantId: string; points: number; status: "DRAFT" | "SUBMITTED" };
export type VoteSource = { participantId: string | null; candidateId?: string | null };

export type JudgingTotal = {
  participantId: string;
  judgePoints: number;
  judgeAverage: number;
  submittedJudges: number;
  publicVotes: number;
  finalPoints: number;
};

export function calculateJudgingTotals(participantIds: string[], scores: ScoreSource[], votes: VoteSource[], method: EventResultMethodValue): JudgingTotal[] {
  return participantIds.map((participantId) => {
    const submitted = scores.filter((score) => score.participantId === participantId && score.status === "SUBMITTED");
    const judgePoints = method === "PUBLIC_VOTE_ONLY" ? 0 : submitted.reduce((sum, score) => sum + score.points, 0);
    const publicVotes = method === "JUDGE_POINTS" ? 0 : votes.filter((vote) => vote.participantId === participantId).length;
    return {
      participantId,
      judgePoints,
      judgeAverage: submitted.length ? judgePoints / submitted.length : 0,
      submittedJudges: submitted.length,
      publicVotes,
      finalPoints: judgePoints + publicVotes,
    };
  });
}

export type CandidateTotal = Omit<JudgingTotal, "participantId"> & { candidateId: string; participantId: string | null };
export function calculateCandidateTotals(candidates: Array<{ id: string; participantId: string | null }>, scores: ScoreSource[], votes: VoteSource[], method: EventResultMethodValue): CandidateTotal[] {
  return candidates.map(candidate => {
    const submitted = candidate.participantId ? scores.filter(score=>score.participantId===candidate.participantId&&score.status==="SUBMITTED") : [];
    const judgePoints = method === "PUBLIC_VOTE_ONLY" ? 0 : submitted.reduce((sum,score)=>sum+score.points,0);
    const publicVotes = method === "JUDGE_POINTS" ? 0 : votes.filter(vote=>vote.candidateId===candidate.id || (!vote.candidateId && candidate.participantId && vote.participantId===candidate.participantId)).length;
    return {candidateId:candidate.id,participantId:candidate.participantId,judgePoints,judgeAverage:submitted.length?judgePoints/submitted.length:0,submittedJudges:submitted.length,publicVotes,finalPoints:judgePoints+publicVotes};
  });
}

export function rankJudgingTotals(totals: JudgingTotal[]) {
  const sorted = [...totals].sort((a, b) => b.finalPoints - a.finalPoints || b.judgePoints - a.judgePoints || b.publicVotes - a.publicVotes);
  const unresolved: string[][] = [];
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (previous.finalPoints === current.finalPoints && previous.judgePoints === current.judgePoints && previous.publicVotes === current.publicVotes) {
      unresolved.push([previous.participantId, current.participantId]);
    }
  }
  return { sorted, unresolved };
}

export function votingIsOpen(event: { active: boolean; public: boolean; votingOpenAt: Date | null; votingCloseAt: Date | null; resultsPublishedAt: Date | null }, now = new Date()) {
  return event.active && event.public && !event.resultsPublishedAt && Boolean(event.votingOpenAt && event.votingOpenAt <= now && (!event.votingCloseAt || event.votingCloseAt > now));
}
