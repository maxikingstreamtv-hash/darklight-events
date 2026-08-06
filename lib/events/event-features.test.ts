import assert from "node:assert/strict";
import test from "node:test";
import { assertEventFeature, getConfiguredWorkflow, NEW_EVENT_FEATURE_DEFAULTS, readEventFeatures, type EventFeatures } from "./event-features";

const full: EventFeatures = {
  usesParticipantRegistration: true,
  usesVehicles: true,
  requiresVehicleApproval: true,
  usesHeats: true,
  usesBracket: true,
  usesResults: true,
  usesPrizes: true,
};
const facts = {
  eventCreated: true,
  registrationOpen: true,
  participantsReady: true,
  vehiclesReady: false,
  heatsReady: false,
  bracketReady: false,
  resultsReady: false,
  completed: false,
};

test("event without vehicles skips vehicle approval", () => {
  assert.equal(getConfiguredWorkflow({ ...full, usesVehicles: false }, facts).some((step) => step.key === "vehicles"), false);
});
test("event without heats skips heat list", () => {
  assert.equal(getConfiguredWorkflow({ ...full, usesHeats: false }, facts).some((step) => step.key === "heats"), false);
});
test("event without bracket skips bracket", () => {
  assert.equal(getConfiguredWorkflow({ ...full, usesBracket: false }, facts).some((step) => step.key === "bracket"), false);
});
test("results without vehicles can proceed directly to results and completion", () => {
  const steps = getConfiguredWorkflow({ ...full, usesVehicles: false, usesHeats: false, usesBracket: false }, facts);
  assert.deepEqual(steps.map((step) => step.key), ["created", "registration", "participants", "results", "completed"]);
});
test("fully configured race retains every workflow step", () => {
  assert.equal(getConfiguredWorkflow(full, facts).length, 8);
});
test("vehicle registration is rejected when vehicles are disabled", () => {
  assert.throws(() => assertEventFeature(false, "Dette event bruger ikke køretøjsregistrering."), /ikke køretøjsregistrering/);
});
test("vehicle approval cannot remain enabled when vehicles are disabled", () => {
  const formData = new FormData();
  formData.set("requiresVehicleApproval", "on");
  assert.equal(readEventFeatures(formData).usesVehicles, false);
  assert.equal(readEventFeatures(formData).requiresVehicleApproval, false);
});
test("a new triathlon-compatible event defaults to no vehicle workflow", () => {
  assert.equal(NEW_EVENT_FEATURE_DEFAULTS.usesVehicles, false);
  assert.equal(NEW_EVENT_FEATURE_DEFAULTS.requiresVehicleApproval, false);
  assert.equal(NEW_EVENT_FEATURE_DEFAULTS.usesHeats, false);
  assert.equal(NEW_EVENT_FEATURE_DEFAULTS.usesBracket, false);
});
test("an absent participant-registration checkbox stays false even with results and prizes",()=>{
  const formData=new FormData();
  formData.set("usesResults","on");
  formData.set("usesPrizes","on");
  const features=readEventFeatures(formData);
  assert.equal(features.usesParticipantRegistration,false);
  assert.equal(features.usesResults,true);
  assert.equal(features.usesPrizes,true);
});
test("workflow without participant registration has no registration steps",()=>{
  const steps=getConfiguredWorkflow({...full,usesParticipantRegistration:false},facts);
  assert.equal(steps.some(step=>step.key==="registration"||step.key==="participants"),false);
});
