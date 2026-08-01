import assert from "node:assert/strict";
import test from "node:test";
import { buildLeaderboard, leaderboardTime, resultStatusLabel, type LeaderboardResult } from "./leaderboard";

function result(overrides: Partial<LeaderboardResult> & { id: string; participantId: string }): LeaderboardResult {
  return { placement: 1, points: null, finishTimeMs: null, status: "APPROVED", createdAt: new Date("2026-07-01"), participant: { name: "Becks", vehicle: null }, competition: { title: "Hovedkonkurrence", event: { title: "Triatlon" } }, ...overrides };
}
test("alle gemte tider aggregeres til bedste tid uden at opfinde point", () => { const rows = buildLeaderboard([result({ id: "a", participantId: "p", finishTimeMs: 800000 }), result({ id: "b", participantId: "p", finishTimeMs: 787000, placement: 2 })]); assert.equal(rows[0].bestTimeMs, 787000); assert.equal(rows[0].resultCount, 2); assert.equal(rows[0].totalPoints, 0); assert.equal(leaderboardTime(rows[0].bestTimeMs), "13:07"); });
test("tid og point bevares og point sorterer primært", () => { const rows = buildLeaderboard([result({ id: "a", participantId: "a", finishTimeMs: 1000, points: 5 }), result({ id: "b", participantId: "b", finishTimeMs: 900, points: 10, participant: { name: "Alex", vehicle: null } })]); assert.equal(rows[0].name, "Alex"); assert.equal(rows[0].bestTimeMs, 900); });
test("DNF og DNS har danske labels", () => { assert.equal(resultStatusLabel("DNF"), "Ikke fuldført"); assert.equal(resultStatusLabel("DNS"), "Ikke startet"); });
