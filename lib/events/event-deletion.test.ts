import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canPermanentlyDeleteEvent, eventDeletionConfirmation, isValidEventDeletionConfirmation, uniqueOwnedEventBlobUrls } from "./event-deletion";

const actions = readFileSync("app/competition/events/actions.ts", "utf8");
const page = readFileSync("app/competition/events/[id]/page.tsx", "utf8");
const form = readFileSync("components/events/PermanentDeleteEventForm.tsx", "utf8");
const schema = readFileSync("prisma/schema.prisma", "utf8");

test("permanent deletion requires the exact visible event title and trims outer whitespace", () => {
  assert.equal(eventDeletionConfirmation("Test Event"), "SLET Test Event");
  assert.equal(isValidEventDeletionConfirmation("Test Event", "  SLET Test Event  "), true);
  assert.equal(isValidEventDeletionConfirmation("Test Event", "SLET test event"), false);
});

test("only SUPER_ADMIN may permanently delete events", () => {
  assert.equal(canPermanentlyDeleteEvent("SUPER_ADMIN"), true);
  for (const role of ["ADMIN", "EVENT_MANAGER", "USER"]) assert.equal(canPermanentlyDeleteEvent(role), false);
});

test("event Blob cleanup ignores external URLs and deduplicates banner and thumbnail", () => {
  const owned = "https://store.public.blob.vercel-storage.com/events/test/image.webp";
  assert.deepEqual(uniqueOwnedEventBlobUrls([owned, owned, "https://example.com/external.jpg", null]), [owned]);
});

test("expected deletion failures redirect to inline feedback instead of throwing runtime errors", () => {
  assert.match(actions, /eventDeleteErrorPath/);
  assert.match(actions, /confirmPermanentDeletion/);
  assert.doesNotMatch(actions.slice(actions.indexOf("export async function deleteCompetitionEventAction")), /hasHistoricData/);
  assert.match(page, /error=\{deleteError \|\| undefined\}/);
  assert.match(form, /role="alert"/);
  assert.match(form, /disabled=\{disabled \|\| pending\}/);
});

test("force delete is transactional, audits before delete and preserves reusable media", () => {
  const transactionStart = actions.indexOf("await prisma.$transaction", actions.indexOf("deleteCompetitionEventAction"));
  const transactionSource = actions.slice(transactionStart, actions.indexOf("ownedBlobUrls.length", transactionStart));
  assert.match(transactionSource, /galleryImage\.updateMany[\s\S]*eventId: null/);
  assert.match(transactionSource, /auditLog\.create/);
  assert.match(transactionSource, /event\.delete/);
  assert.ok(transactionSource.indexOf("auditLog.create") < transactionSource.indexOf("event.delete"));
  assert.match(actions, /await del\(ownedBlobUrls\)/);
});

test("event-owned relations cascade while gallery media is detached and global records remain", () => {
  for (const model of ["Booking", "Competition", "EventRegistration", "TimingSession", "EventPrize", "HallOfFame", "EventTask", "EventAnnouncement"]) {
    const start = schema.indexOf(`model ${model} {`);
    const end = schema.indexOf("\n}", start);
    assert.match(schema.slice(start, end), /event[\s\S]*onDelete: Cascade/);
  }
  const galleryStart = schema.indexOf("model GalleryImage {");
  assert.match(schema.slice(galleryStart, schema.indexOf("\n}", galleryStart)), /event[\s\S]*onDelete: SetNull/);
  assert.match(actions, /transaction\.sponsor\.update/);
  assert.doesNotMatch(actions, /transaction\.(user|vehicle|discipline)\.delete/);
});

test("deletion revalidates ranking, Hall of Fame, timing and public event routes", () => {
  for (const route of ["/rangliste", "/hall-of-fame", "/competition/timing", "/events", "/upcoming", "/competition"]) assert.match(actions, new RegExp(route));
});
