import assert from "node:assert/strict";
import test from "node:test";
import { calculateCandidateTotals, calculateJudgingTotals, rankJudgingTotals, votingIsOpen } from "./judging";

test("dommerpoint plus én point pr stemme beregnes fra rå kilder", () => {
  const totals = calculateJudgingTotals(["p1"], [{ participantId: "p1", points: 8, status: "SUBMITTED" }, { participantId: "p1", points: 9, status: "SUBMITTED" }, { participantId: "p1", points: 10, status: "DRAFT" }], [{ participantId: "p1" }, { participantId: "p1" }], "JUDGE_AND_PUBLIC_VOTE");
  assert.deepEqual(totals[0], { participantId: "p1", judgePoints: 17, judgeAverage: 8.5, submittedJudges: 2, publicVotes: 2, finalPoints: 19 });
});

test("public vote only ignorerer dommerscores", () => {
  assert.equal(calculateJudgingTotals(["p"], [{ participantId: "p", points: 10, status: "SUBMITTED" }], [{ participantId: "p" }], "PUBLIC_VOTE_ONLY")[0].finalPoints, 1);
});

test("tie-breaker vælger dommerpoint, dernæst stemmer og markerer eksakt lighed", () => {
  const ranked = rankJudgingTotals([
    { participantId: "a", judgePoints: 8, judgeAverage: 8, submittedJudges: 1, publicVotes: 2, finalPoints: 10 },
    { participantId: "b", judgePoints: 7, judgeAverage: 7, submittedJudges: 1, publicVotes: 3, finalPoints: 10 },
    { participantId: "c", judgePoints: 7, judgeAverage: 7, submittedJudges: 1, publicVotes: 3, finalPoints: 10 },
  ]);
  assert.deepEqual(ranked.sorted.map(item => item.participantId), ["a", "b", "c"]);
  assert.deepEqual(ranked.unresolved, [["b", "c"]]);
});

test("afstemning kræver offentlig aktiv event og åbent tidsvindue", () => {
  const now = new Date("2026-08-06T12:00:00Z");
  assert.equal(votingIsOpen({ active: true, public: true, votingOpenAt: new Date("2026-08-06T11:00:00Z"), votingCloseAt: new Date("2026-08-06T13:00:00Z"), resultsPublishedAt: null }, now), true);
  assert.equal(votingIsOpen({ active: true, public: true, votingOpenAt: now, votingCloseAt: now, resultsPublishedAt: null }, now), false);
});

test("kandidatstemmer tæller én point og kandidat uden participant kan identificeres",()=>{const totals=calculateCandidateTotals([{id:"c1",participantId:"p1"},{id:"c2",participantId:null}],[{participantId:"p1",points:8,status:"SUBMITTED"}],[{candidateId:"c1",participantId:"p1"}],"JUDGE_AND_PUBLIC_VOTE");assert.equal(totals[0].finalPoints,9);assert.equal(totals[1].participantId,null);});
