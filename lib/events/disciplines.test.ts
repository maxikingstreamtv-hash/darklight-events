import assert from "node:assert/strict";
import test from "node:test";
import { canManageDisciplines, canSelectDisciplineForEvent, disciplineFeatures, publicDisciplines, type DisciplinePreset } from "./disciplines";

const triathlon: DisciplinePreset = {
  id: "tri",
  name: "Triatlon",
  description: "Tre discipliner",
  abbreviation: "TRI",
  category: "Udholdenhed",
  active: true,
  sortOrder: 2,
  usesParticipantRegistration: true,
  usesVehicles: false,
  requiresVehicleApproval: true,
  usesHeats: false,
  usesBracket: false,
  usesResults: true,
  usesPrizes: true,
};

test("inactive disciplines are hidden and public filters follow database order", () => {
  assert.deepEqual(publicDisciplines([
    { active: false, sortOrder: 0, name: "Demo" },
    { active: true, sortOrder: 2, name: "Triatlon" },
    { active: true, sortOrder: 1, name: "Trivia" },
  ]).map((item) => item.name), ["Trivia", "Triatlon"]);
});

test("discipline preset supplies defaults without forcing vehicle approval", () => {
  assert.deepEqual(disciplineFeatures(triathlon), {
    usesParticipantRegistration: true,
    usesVehicles: false,
    requiresVehicleApproval: false,
    usesHeats: false,
    usesBracket: false,
    usesResults: true,
    usesPrizes: true,
  });
});

test("event features remain independently overridable after selecting a preset", () => {
  const features = { ...disciplineFeatures(triathlon), usesBracket: true };
  assert.equal(features.usesBracket, true);
  assert.equal(features.usesVehicles, false);
});

test("admins manage disciplines while Event Managers may select them for events", () => {
  assert.equal(canManageDisciplines("ADMIN"), true);
  assert.equal(canManageDisciplines("EVENT_MANAGER"), false);
  assert.equal(canSelectDisciplineForEvent("EVENT_MANAGER"), true);
  assert.equal(canSelectDisciplineForEvent("USER"), false);
});
