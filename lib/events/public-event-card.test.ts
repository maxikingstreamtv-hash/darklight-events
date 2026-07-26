import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const card = readFileSync("components/events/PublicEventCard.tsx", "utf8");
const detail = readFileSync("app/events/[id]/page.tsx", "utf8");
const competition = readFileSync("app/competition/page.tsx", "utf8");

test("event card exposes detail and registration actions without nested links", () => {
  assert.match(card, /UPCOMING_EVENT_DETAILS_CTA/);
  assert.match(card, /publicEventRegistrationHref\(event\.id\)/);
  assert.match(card, /aria-label=\{`Se \$\{event\.title\}`\}/);
});

test("event detail exposes registration and prize anchors", () => {
  assert.match(detail, /id="registration"/);
  assert.match(detail, /id="prizes"/);
  assert.match(detail, /Regler og praktisk information/);
});

test("competition center reads disciplines from Prisma and has a real empty state", () => {
  assert.match(competition, /prisma\.discipline\.findMany/);
  assert.match(competition, /Ingen discipliner er oprettet endnu/);
  assert.doesNotMatch(competition, /Drift Championship|Street Racing|Drag Racing|Car Show/);
});
