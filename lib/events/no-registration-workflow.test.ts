import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { usesVoteCandidatesAsResultSource } from "./candidate-participants";

test("voting and judging methods use VoteCandidate as their result source",()=>{
  for(const method of ["PUBLIC_VOTE_ONLY","JUDGE_AND_PUBLIC_VOTE","JUDGE_POINTS"])assert.equal(usesVoteCandidatesAsResultSource(method),true);
  assert.equal(usesVoteCandidatesAsResultSource("POINTS_ONLY"),false);
});
test("candidate creation creates an internal participant transactionally",()=>{
  const source=readFileSync("app/competition/judging/candidate-actions.ts","utf8");
  assert.match(source,/\$transaction[\s\S]*ensureVoteCandidateParticipant/);
});
test("publication backfills legacy candidate participants and has no missing-link blocker",()=>{
  const source=readFileSync("app/competition/judging/actions.ts","utf8");
  const page=readFileSync("app/competition/events/[id]/page.tsx","utf8");
  assert.match(source,/ensureAllVoteCandidateParticipants/);
  assert.doesNotMatch(source,/skal kobles til en Participant/);
  assert.doesNotMatch(page,/Manglende Participant-kobling/);
});
test("voting overview requires active public candidates but not registrations",()=>{
  const source=readFileSync("app/afstemning/page.tsx","utf8");
  assert.match(source,/voteCandidates: \{ some: \{ active: true, public: true \} \}/);
  assert.doesNotMatch(source,/registrations|EventRegistration/);
});
test("registration sync is bypassed when the module is disabled",()=>{
  const source=readFileSync("lib/events/result-sync.ts","utf8");
  assert.match(source,/if \(!eventFeatures\.usesParticipantRegistration\) return/);
});
