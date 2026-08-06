import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { canManageManualParticipants, hasParticipantHistory } from "./manual-participants";

test("SUPER_ADMIN and ADMIN can add existing users to every event",()=>{
  assert.equal(canManageManualParticipants({id:"root",role:"SUPER_ADMIN"},{createdById:"other"}),true);
  assert.equal(canManageManualParticipants({id:"admin",role:"ADMIN"},{createdById:"other"}),true);
});
test("EVENT_MANAGER can manage own event but not an inaccessible event",()=>{
  assert.equal(canManageManualParticipants({id:"manager",role:"EVENT_MANAGER"},{createdById:"manager"}),true);
  assert.equal(canManageManualParticipants({id:"manager",role:"EVENT_MANAGER"},{createdById:"other"}),false);
});
test("USER cannot manage manual participants",()=>assert.equal(canManageManualParticipants({id:"user",role:"USER"},{createdById:"user"}),false));
test("all result and operational history blocks blind participant deletion",()=>{
  const empty={results:0,judgeScores:0,publicVotes:0,timingEntries:0,prizeAwards:0,heatEntries:0,bracketSlots:0,bracketOpponents:0,winnerMatches:0};
  assert.equal(hasParticipantHistory(empty),false);
  for(const key of Object.keys(empty) as Array<keyof typeof empty>)assert.equal(hasParticipantHistory({...empty,[key]:1}),true);
});
test("manual user action creates Participant with userId and no EventRegistration",()=>{
  const source=readFileSync("app/competition/eventos-actions.ts","utf8");
  assert.match(source,/addExistingUserParticipantAction/);
  assert.match(source,/participant\.create\(\{data:\{competitionId,userId,name:selectedUser\.displayName/);
  assert.doesNotMatch(source,/addExistingUserParticipantAction[\s\S]{0,5000}eventRegistration\.create/);
  assert.match(source,/P2002[\s\S]*allerede tilføjet/);
});
test("candidate user linking keeps the participant id and therefore votes scores and results",()=>{
  const source=readFileSync("app/competition/eventos-actions.ts","utf8");
  assert.match(source,/candidate\?\.participantId[\s\S]*participant\.update[\s\S]*userId[\s\S]*voteCandidate\.update/);
  assert.doesNotMatch(source,/judgeScore\.delete|publicVote\.delete|result\.delete/);
});
test("profile ranking and Hall of Fame resolve results through Participant userId",()=>{
  assert.match(readFileSync("app/profile/page.tsx","utf8"),/where: \{ userId: sessionUser\.id \}/);
  assert.match(readFileSync("lib/results/leaderboard.ts","utf8"),/participant\.userId \|\| result\.participantId/);
  assert.match(readFileSync("app/hall-of-fame/page.tsx","utf8"),/result\.participant\.userId/);
});
