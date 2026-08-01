import assert from "node:assert/strict";
import test from "node:test";
import { hasPrizePlacementMismatch, resultHistoryChanged, resultHistorySnapshot } from "./result-history";

const original = { placement: 1, finishTimeMs: 787_000, reactionTimeMs: null, points: 100, status: "APPROVED", notes: null };

test("audit snapshot contains old and new editable result values", () => {
  const updated = { ...original, placement: 2, finishTimeMs: 785_420, points: 90, status: "PENDING" };
  assert.equal(resultHistoryChanged(original, updated), true);
  assert.deepEqual(resultHistorySnapshot(original), original);
  assert.deepEqual(resultHistorySnapshot(updated), updated);
});

test("clearing an existing time is recorded as a change", () => {
  assert.equal(resultHistoryChanged(original, { ...original, finishTimeMs: null }), true);
});

test("manual prize assignments are detected but never mutated", () => {
  const prizes = [{ placement: 1, winners: [{ participant: { id: "participant-1" } }] }];
  assert.equal(hasPrizePlacementMismatch({ participantId: "participant-1", placement: 2 }, prizes), true);
  assert.equal(prizes[0].placement, 1);
});
