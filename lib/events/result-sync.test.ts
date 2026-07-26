import assert from "node:assert/strict";
import test from "node:test";
import { getResultProgress, isResultEligibleStatus, shouldCreateDefaultCompetition } from "./result-sync";

test("approved and checked-in registrations are eligible for results", () => {
  assert.equal(isResultEligibleStatus("APPROVED"), true);
  assert.equal(isResultEligibleStatus("CHECKED_IN"), true);
  assert.equal(isResultEligibleStatus("REJECTED"), false);
  assert.equal(isResultEligibleStatus("CANCELLED"), false);
});
test("default competition is only created for result events without competitions", () => {
  assert.equal(shouldCreateDefaultCompetition(true, 0), true);
  assert.equal(shouldCreateDefaultCompetition(true, 1), false);
  assert.equal(shouldCreateDefaultCompetition(true, 2), false);
  assert.equal(shouldCreateDefaultCompetition(false, 0), false);
});
test("re-running default competition decision is idempotent after the first creation", () => {
  assert.equal(shouldCreateDefaultCompetition(true, 0), true);
  assert.equal(shouldCreateDefaultCompetition(true, 1), false);
});
test("one approved participant is ready for results instead of missing", () => {
  assert.deepEqual(getResultProgress([{
    participants: [{ id: "p1", status: "APPROVED" }],
    results: [],
  }]), {
    readyParticipants: 1,
    completedResults: 0,
    missingResults: 1,
    hasParticipants: true,
    complete: false,
  });
});
test("rejected participants do not count as result candidates", () => {
  assert.equal(getResultProgress([{ participants: [{ id: "p1", status: "REJECTED" }], results: [] }]).hasParticipants, false);
});
