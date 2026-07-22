import assert from "node:assert/strict";
import test from "node:test";
import { getEventRegistrationLoginHref, getRegistrationState } from "./registration-state";

const now = new Date("2026-07-22T12:00:00.000Z");
const future = new Date("2026-08-22T12:00:00.000Z");

function state(overrides: Partial<Parameters<typeof getRegistrationState>[0]> = {}) {
  return getRegistrationState({
    status: "REGISTRATION_OPEN",
    startsAt: future,
    maxParticipants: 30,
    registeredParticipants: 0,
    now,
    ...overrides,
  });
}

test("REGISTRATION_OPEN, future event and free spots is open", () => {
  const result = state();
  assert.equal(result.isOpen, true);
  assert.equal(result.canRegister, true);
  assert.equal(result.label, "Tilmeldingen er \u00e5ben");
  assert.equal(result.remainingSpots, 30);
});

test("an event at capacity is full", () => {
  const result = state({ registeredParticipants: 30 });
  assert.equal(result.reason, "FULL");
  assert.equal(result.label, "Eventet er fyldt");
});

test("a passed registration deadline closes registration", () => {
  const result = state({ registrationCloseAt: new Date("2026-07-21T12:00:00.000Z") });
  assert.equal(result.reason, "DEADLINE_PASSED");
});

test("DRAFT is not open", () => assert.equal(state({ status: "DRAFT" }).reason, "NOT_OPEN"));
test("COMPLETED is completed", () => assert.equal(state({ status: "COMPLETED" }).reason, "COMPLETED"));
test("CANCELLED is cancelled", () => assert.equal(state({ status: "CANCELLED" }).reason, "CANCELLED"));

test("an already registered user cannot register twice", () => {
  const result = state({ userRegistrationStatus: "APPROVED" });
  assert.equal(result.isAlreadyRegistered, true);
  assert.equal(result.canRegister, false);
});

test("a guest sees open status and can continue to login", () => {
  const result = state({ userRegistrationStatus: null });
  assert.equal(result.label, "Tilmeldingen er \u00e5ben");
  assert.equal(result.canRegister, true);
  assert.equal(getEventRegistrationLoginHref("event-123"), "/login?returnTo=%2Fevents%2Fevent-123");
});
