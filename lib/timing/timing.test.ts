import assert from "node:assert/strict";
import test from "node:test";
import { buildTimingResultRows, calculateElapsedMs, canManageTiming, canReopenTiming, formatTimingMs, provisionalPlacements, timingActiveKey, timingSummary } from "./timing";

test("server timestamps calculate millisecond elapsed time and reject negative time", () => {
  assert.equal(calculateElapsedMs(new Date("2026-01-01T00:00:00.000Z"), new Date("2026-01-01T00:01:02.345Z")), 62_345);
  assert.throws(() => calculateElapsedMs(new Date(10), new Date(9)), /negativ/);
});

test("timing display supports below and above one hour", () => {
  assert.equal(formatTimingMs(62_345), "01:02.345");
  assert.equal(formatTimingMs(3_662_345), "01:01:02.345");
});

test("provisional placement only ranks finished normal times", () => {
  const placements = provisionalPlacements([
    { id: "slow", status: "FINISHED", elapsedMs: 20_000 },
    { id: "dnf", status: "DNF", elapsedMs: null },
    { id: "fast", status: "FINISHED", elapsedMs: 10_000 },
    { id: "running", status: "RUNNING", elapsedMs: null },
  ]);
  assert.equal(placements.get("fast"), 1);
  assert.equal(placements.get("slow"), 2);
  assert.equal(placements.has("dnf"), false);
});

test("summary detects terminal session and remaining entries", () => {
  assert.equal(timingSummary([{ status: "FINISHED" }, { status: "DNF" }, { status: "DNS" }]).allTerminal, true);
  assert.deepEqual(timingSummary([{ status: "RUNNING" }, { status: "FINISHED" }]), { total: 2, running: 1, finished: 1, dnf: 0, dns: 0, disqualified: 0, missing: 1, allTerminal: false });
});

test("active key scopes one active session per event competition", () => assert.equal(timingActiveKey("event", "competition"), "event:competition"));

test("timing RBAC permits staff and restricts reopening", () => {
  for (const role of ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"]) assert.equal(canManageTiming(role), true);
  assert.equal(canManageTiming("USER"), false);
  assert.equal(canReopenTiming("SUPER_ADMIN"), true);
  assert.equal(canReopenTiming("ADMIN"), true);
  assert.equal(canReopenTiming("EVENT_MANAGER"), false);
});

test("result transfer rows rank time and omit placement for terminal exceptions", () => {
  const rows = buildTimingResultRows([
    { id: "b", participantId: "pb", status: "FINISHED", elapsedMs: 20_000, note: null },
    { id: "a", participantId: "pa", status: "FINISHED", elapsedMs: 10_000, note: "rettet" },
    { id: "c", participantId: "pc", status: "DNF", elapsedMs: null, note: null },
  ]);
  assert.deepEqual(rows.map(({ participantId, placement, finishTimeMs, status }) => ({ participantId, placement, finishTimeMs, status })), [
    { participantId: "pb", placement: 2, finishTimeMs: 20_000, status: "APPROVED" },
    { participantId: "pa", placement: 1, finishTimeMs: 10_000, status: "APPROVED" },
    { participantId: "pc", placement: 0, finishTimeMs: null, status: "DNF" },
  ]);
  assert.throws(() => buildTimingResultRows([{ id: "x", participantId: "p", status: "RUNNING", elapsedMs: null, note: null }]), /slutstatus/);
});
