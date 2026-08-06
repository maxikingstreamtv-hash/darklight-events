import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { canManageVoteCandidates, ownedCandidateBlobUrls, readVoteCandidate, visibleVoteCandidates } from "./vote-candidates";

function validForm(){const data=new FormData();data.set("ownerName","Ronni");data.set("vehicleName","DarkLight GT");data.set("imageUrl","https://example.com/car.webp");return data;}
test("kandidat kræver billede, bilnavn og ejer",()=>{for(const missing of ["ownerName","vehicleName","imageUrl"]){const data=validForm();data.delete(missing);assert.throws(()=>readVoteCandidate(data));}});
test("kandidat kan kobles valgfrit til participant vehicle og user",()=>{const data=validForm();data.set("participantId","p1");data.set("vehicleId","v1");data.set("ownerUserId","u1");assert.deepEqual({...readVoteCandidate(data),imageUrl:undefined,ownerName:undefined,vehicleName:undefined},{vehicleModel:null,description:null,startNumber:null,participantId:"p1",vehicleId:"v1",ownerUserId:"u1",sortOrder:0,imageUrl:undefined,ownerName:undefined,vehicleName:undefined});});
test("kun staffroller administrerer kandidater",()=>{assert.equal(canManageVoteCandidates("SUPER_ADMIN"),true);assert.equal(canManageVoteCandidates("ADMIN"),true);assert.equal(canManageVoteCandidates("EVENT_MANAGER"),true);assert.equal(canManageVoteCandidates("JUDGE"),false);assert.equal(canManageVoteCandidates("USER"),false);});
test("skjulte kandidater filtreres offentligt",()=>{const now=new Date();const rows=visibleVoteCandidates([{id:"a",active:true,public:true,sortOrder:2,createdAt:now},{id:"b",active:false,public:true,sortOrder:1,createdAt:now}]);assert.deepEqual(rows.map(row=>row.id),["a"]);});
test("Blob cleanup deduplikerer ejede URLs og ignorerer eksterne",()=>{const owned="https://store.public.blob.vercel-storage.com/votes/a.webp";assert.deepEqual(ownedCandidateBlobUrls([owned,owned,"https://example.com/a.webp"]),[owned]);});
test("stemmehandlinger bruger samme unique stemme og har inline feedback",()=>{const source=readFileSync("app/competition/judging/actions.ts","utf8");assert.match(source,/eventId_userId/);assert.match(source,/deleteMany\(\{\s*where:\s*\{\s*eventId,\s*userId/);assert.match(source,/voteFeedback/);assert.match(source,/PUBLIC_VOTE_WITHDRAWN/);});
test("offentlig stemmeside vælger kun aktive offentlige kandidater og viser ingen totals",()=>{const source=readFileSync("app/events/[id]/vote/page.tsx","utf8");assert.match(source,/voteCandidates:\{where:\{active:true,public:true\}/);assert.doesNotMatch(source,/publicVotes|judgePoints|finalPoints/);});
