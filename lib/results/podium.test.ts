import assert from "node:assert/strict";
import test from "node:test";
import { hasCompletePodium, podiumResults, publicPlacementPrizes } from "./podium";
test("podiet kræver 1, 2 og 3 fra Result-data", () => { assert.equal(hasCompletePodium([{placement:1},{placement:2},{placement:3}]), true); assert.equal(hasCompletePodium([{placement:1},{placement:2}]), false); });
test("podiet returneres i placeringsrækkefølge", () => { assert.deepEqual(podiumResults([{placement:3,id:"c"},{placement:1,id:"a"},{placement:2,id:"b"}]).map((item) => item?.id), ["a","b","c"]); });
test("kun aktive præmier og maksimalt fem vises", () => { const prizes = Array.from({length:7},(_,i)=>({id:i,placement:1,active:i!==2})); assert.equal(publicPlacementPrizes(prizes,1).length,5); assert.equal(publicPlacementPrizes(prizes,1).some((p)=>p.id===2),false); });
