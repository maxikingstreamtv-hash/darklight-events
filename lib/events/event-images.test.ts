import assert from "node:assert/strict";
import test from "node:test";
import { clampEventImageFocus, eventImageFitClass, eventImageObjectPosition, getRenderableEventImageUrl, isBlobStorageConfigured, isPermanentEventImageUrl, MAX_EVENT_IMAGE_SIZE, validateEventImage } from "./event-images";

test("accepts supported event image types", () => {
  assert.doesNotThrow(() => validateEventImage({ type: "image/webp", size: 1024 }));
});
test("rejects unsupported file types", () => {
  assert.throws(() => validateEventImage({ type: "image/svg+xml", size: 1024 }), /JPG/);
});
test("rejects files larger than 8 MB", () => {
  assert.throws(() => validateEventImage({ type: "image/jpeg", size: MAX_EVENT_IMAGE_SIZE + 1 }), /8 MB/);
});
test("rejects browser preview URLs from persistence", () => {
  assert.equal(isPermanentEventImageUrl("blob:https://example.com/id"), false);
  assert.equal(isPermanentEventImageUrl("https://store.public.blob.vercel-storage.com/events/id/image.webp"), true);
});
test("event cards use fallback for missing or invalid images", () => {
  assert.equal(getRenderableEventImageUrl(null), null);
  assert.equal(getRenderableEventImageUrl("blob:https://example.com/expired"), null);
});
test("missing Blob token gives a safe unconfigured state", () => {
  assert.equal(isBlobStorageConfigured(undefined), false);
  assert.equal(isBlobStorageConfigured(""), false);
  assert.equal(isBlobStorageConfigured("configured"), true);
});
test("event image focus defaults to center and clamps invalid ranges", () => {
  assert.equal(eventImageObjectPosition(), "50% 50%");
  assert.equal(eventImageObjectPosition(-20, 140), "0% 100%");
  assert.equal(clampEventImageFocus(Number.NaN), 50);
});
test("banner and card views use safe, distinct fit rules", () => {
  assert.equal(eventImageFitClass("banner"), "object-contain");
  assert.equal(eventImageFitClass("card"), "object-cover object-center");
});
