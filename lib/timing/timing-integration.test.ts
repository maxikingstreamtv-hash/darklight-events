import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const actions = readFileSync("app/competition/timing/actions.ts", "utf8");
const page = readFileSync("app/competition/timing/page.tsx", "utf8");
const client = readFileSync("components/timing/TimingClient.tsx", "utf8");
const sidebar = readFileSync("components/layout/AppSidebar.tsx", "utf8");
const commandCenter = readFileSync("app/competition/events/[id]/page.tsx", "utf8");

test("timing module is protected by staff RBAC and linked from staff navigation", () => {
  assert.match(page, /canManageTiming\(user\.role\)/);
  assert.match(actions, /requireTimingStaff/);
  assert.match(sidebar, /href: "\/competition\/timing", label: "Tidstagning"/);
  assert.match(commandCenter, /\/competition\/timing\?eventId=/);
});

test("session start uses one server timestamp for session and all ready entries", () => {
  assert.match(actions, /const startedAt = new Date\(\)/);
  assert.match(actions, /timingSession\.updateMany[\s\S]*startedAt/);
  assert.match(actions, /timingEntry\.updateMany[\s\S]*data: \{ status: "RUNNING", startedAt \}/);
});

test("participant stop is conditional, server timed and concurrency safe", () => {
  assert.match(actions, /const stoppedAt = new Date\(\)/);
  assert.match(actions, /calculateElapsedMs\(entry\.startedAt, stoppedAt\)/);
  assert.match(actions, /where: \{ id: entryId, status: "RUNNING", stoppedAt: null \}/);
  assert.match(actions, /Deltagerens tid er allerede stoppet/);
  assert.match(actions, /isolationLevel: "Serializable"/);
});

test("manual correction requires a reason and records before and after audit values", () => {
  assert.match(actions, /Angiv en begrundelse for den manuelle tidsrettelse/);
  assert.match(actions, /action: "TIMING_TIME_CORRECTED"/);
  assert.match(actions, /previous: \{ elapsedMs: changed\.previous \}/);
  assert.match(actions, /next: \{ elapsedMs \}/);
});

test("result transfer is transactional, idempotent and requires overwrite confirmation", () => {
  assert.match(actions, /transaction\.result\.upsert/);
  assert.match(actions, /competitionId_participantId/);
  assert.match(actions, /confirmOverwrite/);
  assert.match(actions, /eksisterende resultater er låst/);
  assert.match(actions, /TIMING_RESULTS_TRANSFERRED/);
  for (const route of ["/rangliste", "/hall-of-fame", "/live-resultater", "/competition/live-center"]) assert.match(actions, new RegExp(route));
});

test("client clock derives display from timestamps and polls authoritative server state", () => {
  assert.match(client, /now - new Date\(startedAt\)\.getTime\(\)/);
  assert.match(client, /setInterval[\s\S]*75/);
  assert.match(client, /router\.refresh\(\)/);
  assert.match(client, /3000/);
  assert.match(client, /Forbundet/);
  assert.match(client, /Genopretter/);
});

test("terminal timing supports DNF DNS disqualification reopening and locking", () => {
  for (const action of ["TIMING_STATUS_CHANGED", "TIMING_PARTICIPANT_REOPENED", "TIMING_SESSION_FINISHED", "TIMING_SESSION_REOPENED", "TIMING_SESSION_CANCELLED"]) assert.match(actions, new RegExp(action));
  assert.match(page, /DNF/);
  assert.match(page, /DNS/);
  assert.match(page, /Diskvalific/);
  assert.match(actions, /resultsTransferredAt: null, activeKey:/);
});

test("participant snapshot is stable and later participants require an explicit action", () => {
  assert.match(actions, /entries: \{ create: participants\.map/);
  assert.match(actions, /addParticipantToTimingSessionAction/);
  assert.match(page, /Tilføj godkendt deltager eksplicit/);
  assert.match(actions, /TimingEntry_timingSessionId_participantId|P2002/);
});
