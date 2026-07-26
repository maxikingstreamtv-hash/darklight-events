import assert from "node:assert/strict";
import test from "node:test";
import { canManageEventCommandCenter, canUseDangerousEventActions, commandCenterHref, getCommandCenterTabs, resolveCommandCenterTab } from "./command-center";
import type { EventFeatures } from "./event-features";

const full: EventFeatures = {
  usesParticipantRegistration: true,
  usesVehicles: true,
  requiresVehicleApproval: true,
  usesHeats: true,
  usesBracket: true,
  usesResults: true,
  usesPrizes: true,
};

test("Super Admin sees every active Command Center tab", () => {
  assert.equal(canManageEventCommandCenter("SUPER_ADMIN"), true);
  assert.deepEqual(getCommandCenterTabs(full).slice(0, 10).map((tab) => tab.key), ["overview", "details", "participants", "vehicles", "heats", "bracket", "results", "prizes", "media", "settings"]);
});
test("Event Manager can manage normal event operations", () => assert.equal(canManageEventCommandCenter("EVENT_MANAGER"), true));
test("disabled modules hide their tabs", () => {
  const visible = getCommandCenterTabs({ ...full, usesVehicles: false, usesHeats: false, usesBracket: false }).map((tab) => tab.key);
  assert.equal(visible.includes("vehicles"), false);
  assert.equal(visible.includes("heats"), false);
  assert.equal(visible.includes("bracket"), false);
});
test("direct link to a disabled tab falls back to overview", () => {
  assert.equal(resolveCommandCenterTab("vehicles", { ...full, usesVehicles: false }), "overview");
});
test("ordinary users and judge-equivalent users gain no write access", () => {
  assert.equal(canManageEventCommandCenter("USER"), false);
  assert.equal(canUseDangerousEventActions("EVENT_MANAGER"), false);
  assert.equal(canUseDangerousEventActions("SUPER_ADMIN"), true);
});
test("new events and in-page actions stay on the Event Command Center route", () => {
  assert.equal(commandCenterHref("event-1", "overview"), "/competition/events/event-1?tab=overview#oversigt");
  assert.equal(commandCenterHref("event-1", "participants"), "/competition/events/event-1?tab=participants#deltagere");
});
