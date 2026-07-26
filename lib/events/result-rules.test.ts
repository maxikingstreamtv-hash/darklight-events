import assert from "node:assert/strict";
import test from "node:test";
import { canUnlockResults, validateResultRows } from "./result-rules";

const valid = { participantId: "p1", placement: 1, placementProvided: true, points: 100, finishTimeMs: null, status: "APPROVED" };
test("valid results are accepted", () => assert.doesNotThrow(() => validateResultRows([valid])));
test("duplicate placements are rejected", () => assert.throws(() => validateResultRows([valid, { ...valid, participantId: "p2" }]), /samme placering/));
test("DNF and DNS with placement are rejected", () => {
  assert.throws(() => validateResultRows([{ ...valid, status: "DNF" }]), /normal placering/);
  assert.throws(() => validateResultRows([{ ...valid, status: "DNS" }]), /normal placering/);
});
test("results accept only time, only points, or both", () => {
  assert.doesNotThrow(() => validateResultRows([{ ...valid, placement: 0, placementProvided: false, points: null, finishTimeMs: 92_000 }]));
  assert.doesNotThrow(() => validateResultRows([{ ...valid, placement: 0, placementProvided: false, points: 250, finishTimeMs: null }]));
  assert.doesNotThrow(() => validateResultRows([{ ...valid, placement: 0, placementProvided: false, points: 250, finishTimeMs: 92_000 }]));
});
test("DNF and DNS accept empty result values", () => {
  assert.doesNotThrow(() => validateResultRows([{ ...valid, placement: 0, placementProvided: false, points: null, finishTimeMs: null, status: "DNF" }]));
  assert.doesNotThrow(() => validateResultRows([{ ...valid, placement: 0, placementProvided: false, points: null, finishTimeMs: null, status: "DNS" }]));
});
test("result unlocking respects RBAC", () => {
  assert.equal(canUnlockResults("SUPER_ADMIN"), true);
  assert.equal(canUnlockResults("ADMIN"), true);
  assert.equal(canUnlockResults("EVENT_MANAGER"), false);
});
