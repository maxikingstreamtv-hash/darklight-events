import assert from "node:assert/strict";
import test from "node:test";
import { getRegistrationPeriodState, isRegistrationPeriodConfigured } from "./registration-period";

const now = new Date("2026-07-20T12:00:00.000Z");
const future = new Date("2026-07-30T12:00:00.000Z");

test("a close deadline configures registration even when opening is immediate", () => {
  const state = getRegistrationPeriodState({ usesParticipantRegistration: true, registrationOpenAt: null, registrationCloseAt: future }, now);
  assert.equal(state, "configured");
  assert.equal(isRegistrationPeriodConfigured(state), true);
});
test("missing close date is reported consistently", () => {
  assert.equal(getRegistrationPeriodState({ usesParticipantRegistration: true, registrationOpenAt: now, registrationCloseAt: null }, now), "missing_close");
});
test("both missing dates are reported consistently", () => {
  assert.equal(getRegistrationPeriodState({ usesParticipantRegistration: true, registrationOpenAt: null, registrationCloseAt: null }, now), "missing_both");
});
test("events without participant registration require no period", () => {
  assert.equal(getRegistrationPeriodState({ usesParticipantRegistration: false, registrationOpenAt: null, registrationCloseAt: null }, now), "not_required");
});
test("an elapsed configured period remains configured but is marked closed", () => {
  const state = getRegistrationPeriodState({ usesParticipantRegistration: true, registrationOpenAt: null, registrationCloseAt: new Date("2026-07-01T12:00:00.000Z") }, now);
  assert.equal(state, "already_closed");
  assert.equal(isRegistrationPeriodConfigured(state), true);
});
