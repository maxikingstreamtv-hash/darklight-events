import assert from "node:assert/strict";
import test from "node:test";
import {
  isVisibleUpcomingEvent,
  getPublicPrizeIndicator,
  sortUpcomingEvents,
  UPCOMING_EVENT_CTA,
  UPCOMING_EVENT_DETAILS_CTA,
  UPCOMING_EVENTS_EMPTY_TITLE,
  publicEventHref,
  publicEventRegistrationHref,
} from "./public-events";

const now = new Date("2026-07-26T12:00:00.000Z");
const future = new Date("2026-08-01T12:00:00.000Z");
const base = { active: true, public: true, status: "PUBLISHED", startsAt: future, endsAt: null };

test("public future event is visible", () => assert.equal(isVisibleUpcomingEvent(base, now), true));
test("private event is hidden", () => assert.equal(isVisibleUpcomingEvent({ ...base, public: false }, now), false));
test("cancelled event is hidden", () => assert.equal(isVisibleUpcomingEvent({ ...base, status: "CANCELLED" }, now), false));
test("completed event is hidden", () => assert.equal(isVisibleUpcomingEvent({ ...base, status: "COMPLETED" }, now), false));
test("events are sorted by ascending start date", () => {
  const events = sortUpcomingEvents([
    { title: "Sen", startsAt: new Date("2026-09-01T12:00:00.000Z") },
    { title: "Tidlig", startsAt: new Date("2026-08-01T12:00:00.000Z") },
  ]);
  assert.deepEqual(events.map((event) => event.title), ["Tidlig", "Sen"]);
});
test("empty state and event CTA use the public Danish copy", () => {
  assert.equal(UPCOMING_EVENTS_EMPTY_TITLE, "Der er ingen kommende events lige nu.");
  assert.equal(UPCOMING_EVENT_CTA, "Tilmeld event");
  assert.equal(UPCOMING_EVENT_DETAILS_CTA, "Se event");
  assert.equal(publicEventHref("event-1"), "/events/event-1");
  assert.equal(publicEventRegistrationHref("event-1"), "/events/event-1#registration");
});
test("event cards only indicate active public prizes when the module is enabled", () => {
  assert.equal(getPublicPrizeIndicator({ usesPrizes: true, prizes: [{ id: "p1" }, { id: "p2" }] }), "2 præmier");
  assert.equal(getPublicPrizeIndicator({ usesPrizes: false, prizes: [{ id: "p1" }] }), null);
  assert.equal(getPublicPrizeIndicator({ usesPrizes: true, prizes: [] }), null);
});
