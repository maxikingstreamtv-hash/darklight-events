import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { canManageVoteCandidates, ownedCandidateBlobUrls, readVoteCandidate, visibleVoteCandidates } from "./vote-candidates";

function imageForm(){const data=new FormData();data.set("imageUrl","https://example.com/car.webp");return data;}
test("kandidat kan oprettes med kun billede",()=>{const candidate=readVoteCandidate(imageForm());assert.equal(candidate.imageUrl,"https://example.com/car.webp");assert.equal(candidate.ownerName,null);assert.equal(candidate.vehicleName,null);assert.equal(candidate.vehicleModel,null);assert.equal(candidate.startNumber,null);assert.equal(candidate.description,null);});
test("billede er det eneste obligatoriske kandidatfelt",()=>{assert.throws(()=>readVoteCandidate(new FormData()),/billede/i);});
test("kandidat kan fortsat kobles valgfrit til Participant",()=>{const data=imageForm();data.set("participantId","p1");assert.equal(readVoteCandidate(data).participantId,"p1");});
test("kun staffroller administrerer kandidater",()=>{for(const role of ["SUPER_ADMIN","ADMIN","EVENT_MANAGER"])assert.equal(canManageVoteCandidates(role),true);for(const role of ["JUDGE","USER"])assert.equal(canManageVoteCandidates(role),false);});
test("skjulte kandidater filtreres offentligt",()=>{const now=new Date();const rows=visibleVoteCandidates([{id:"a",active:true,public:true,sortOrder:2,createdAt:now},{id:"b",active:false,public:true,sortOrder:1,createdAt:now}]);assert.deepEqual(rows.map(row=>row.id),["a"]);});
test("Blob cleanup deduplikerer ejede URLs og ignorerer eksterne",()=>{const owned="https://store.public.blob.vercel-storage.com/votes/a.webp";assert.deepEqual(ownedCandidateBlobUrls([owned,owned,"https://example.com/a.webp"]),[owned]);});
test("stemme, skift og fortryd genbruger én unique stemme",()=>{const source=readFileSync("app/competition/judging/actions.ts","utf8");assert.match(source,/eventId_userId/);assert.match(source,/castVoteAction/);assert.match(source,/changeVoteAction/);assert.match(source,/withdrawVoteAction/);assert.match(source,/PUBLIC_VOTE_WITHDRAWN/);});
test("offentlig query sender kun kandidat-id og billede",()=>{const source=readFileSync("app/events/[id]/vote/page.tsx","utf8");assert.match(source,/select:\{id:true,imageUrl:true\}/);assert.doesNotMatch(source,/ownerName|vehicleName|vehicleModel|startNumber|description|publicVotes|judgePoints|finalPoints/);});
test("offentligt kandidatkort har kun billede og Stem Fortryd",()=>{const page=readFileSync("app/events/[id]/vote/page.tsx","utf8");const buttons=readFileSync("components/events/VoteButtons.tsx","utf8");assert.match(page,/alt="Afstemningsbillede"/);assert.match(buttons,/>Stem</);assert.match(buttons,/>Fortryd</);});
test("kandidatsletning fjerner stemmer i transaktion før Blob cleanup",()=>{const source=readFileSync("app/competition/judging/candidate-actions.ts","utf8");const votes=source.indexOf("tx.publicVote.deleteMany");const candidate=source.indexOf("tx.voteCandidate.delete");const cleanup=source.indexOf("ownedCandidateBlobUrls",source.indexOf("deleteVoteCandidateAction"));assert.ok(votes>0&&candidate>votes&&cleanup>candidate);});
