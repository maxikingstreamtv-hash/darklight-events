import assert from "node:assert/strict";
import test from "node:test";
import { createBracketPlan, createHeatPlan } from "../eventos/engine";
import { canManageEventCommandCenter } from "./command-center";
import { assertBracketWinner, assertMutableHeat, commandCenterReturnHref, filterAndSortParticipants, normalizeInternalNote } from "./command-center-operations";

const participants = [
  { id: "2", status: "PENDING", createdAt: new Date("2026-01-02"), internalNote: "VIP", vehicleId: null, user: { displayName: "Åse", username: "ase", darklightId: "DL-2" } },
  { id: "1", status: "APPROVED", createdAt: new Date("2026-01-01"), internalNote: null, vehicleId: "v1", user: { displayName: "Bent", username: "bent", darklightId: "DL-1" } },
];

test("participants can be searched, filtered and sorted", () => {
  assert.deepEqual(filterAndSortParticipants(participants, { query: "dl-2" }).map((item) => item.id), ["2"]);
  assert.deepEqual(filterAndSortParticipants(participants, { status: "APPROVED" }).map((item) => item.id), ["1"]);
  assert.deepEqual(filterAndSortParticipants(participants, { missingVehicle: true, sort: "name" }).map((item) => item.id), ["2"]);
});

test("locked heats cannot be edited", () => {
  assert.throws(() => assertMutableHeat({ locked: true, status: "LOCKED" }), /låst/);
  assert.doesNotThrow(() => assertMutableHeat({ locked: false, status: "READY" }));
});

test("bracket winner must belong to the match and may be corrected", () => {
  assert.doesNotThrow(() => assertBracketWinner({ participantAId: "a", participantBId: "b" }, "a"));
  assert.doesNotThrow(() => assertBracketWinner({ participantAId: "a", participantBId: "b" }, "b"));
  assert.throws(() => assertBracketWinner({ participantAId: "a", participantBId: "b" }, "c"));
});

test("actions preserve the active tab", () => {
  assert.equal(commandCenterReturnHref("event-1", "heats", "updated"), "/competition/events/event-1?tab=heats&saved=updated#køreliste");
});

test("bulk participant and reset operations respect Command Center RBAC", () => {
  assert.equal(canManageEventCommandCenter("SUPER_ADMIN"), true);
  assert.equal(canManageEventCommandCenter("ADMIN"), true);
  assert.equal(canManageEventCommandCenter("EVENT_MANAGER"), true);
  assert.equal(canManageEventCommandCenter("USER"), false);
});

test("participant notes can be updated and cleared", () => {
  assert.equal(normalizeInternalNote("  intern note  "), "intern note");
  assert.equal(normalizeInternalNote("   "), null);
});

test("heats and brackets are generated from ready participants", () => {
  const ready = [
    { id: "a", name: "A", seed: 1 },
    { id: "b", name: "B", seed: 2 },
    { id: "c", name: "C", seed: 3 },
    { id: "d", name: "D", seed: 4 },
  ];
  assert.equal(createHeatPlan(ready, 2).length, 2);
  assert.equal(createBracketPlan(ready).matches.length, 2);
});
