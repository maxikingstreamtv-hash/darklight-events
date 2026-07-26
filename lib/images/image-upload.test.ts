import assert from "node:assert/strict";
import test from "node:test";
import {
  imageBlobPath,
  isOwnedBlobImage,
  isPermanentImageUrl,
  validateImageFile,
  validateImageFileMetadata,
} from "./image-upload";
import {
  deleteNewBlobAfterFailedSave,
  deleteReplacedBlobImage,
} from "./blob-cleanup";

function mockFile(name: string, type: string, bytes: number[], size = bytes.length) {
  return {
    name,
    type,
    size,
    async arrayBuffer() {
      return Uint8Array.from(bytes).buffer;
    },
  };
}

test("profile and sponsor images accept real JPG, PNG and WebP signatures", async () => {
  await validateImageFile(mockFile("avatar.jpg", "image/jpeg", [0xff, 0xd8, 0xff, 0x00]), "profile");
  await validateImageFile(mockFile("logo.png", "image/png", [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "sponsor");
  await validateImageFile(mockFile("logo.webp", "image/webp", [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]), "sponsor");
});

test("invalid type, extension, empty file and oversized profile image are rejected", () => {
  assert.throws(() => validateImageFileMetadata({ name: "avatar.svg", type: "image/svg+xml", size: 10 }, "profile"));
  assert.throws(() => validateImageFileMetadata({ name: "avatar.png", type: "image/jpeg", size: 10 }, "profile"));
  assert.throws(() => validateImageFileMetadata({ name: "avatar.jpg", type: "image/jpeg", size: 0 }, "profile"));
  assert.throws(() => validateImageFileMetadata({ name: "avatar.jpg", type: "image/jpeg", size: 5 * 1024 * 1024 + 1 }, "profile"));
});

test("false image content is rejected even with matching MIME and extension", async () => {
  await assert.rejects(validateImageFile(mockFile("avatar.jpg", "image/jpeg", [1, 2, 3, 4]), "profile"));
});

test("paths are unique-ready, scoped and sanitized", () => {
  assert.equal(imageBlobPath("profile", "user/1", "My Face.JPG", "uuid"), "profiles/user1/uuid-my-face.jpg");
  assert.equal(imageBlobPath("sponsor", "sponsor-1", "Logo.PNG", "uuid"), "sponsors/sponsor-1/uuid-logo.png");
});

test("permanent external URLs remain valid while browser previews are rejected", () => {
  assert.equal(isPermanentImageUrl("https://images.example.com/avatar.jpg"), true);
  assert.equal(isPermanentImageUrl("blob:https://example.com/preview"), false);
});

test("owned Blob images are cleaned after replacement but external URLs are preserved", async () => {
  const deleted: string[] = [];
  const remove = async (url: string | string[]) => { deleted.push(...(Array.isArray(url) ? url : [url])); };
  const owned = "https://store.public.blob.vercel-storage.com/profiles/user/old.jpg";
  assert.equal(isOwnedBlobImage(owned), true);
  assert.equal(await deleteReplacedBlobImage(owned, "https://example.com/new.jpg", remove), true);
  assert.equal(await deleteReplacedBlobImage("https://example.com/old.jpg", null, remove), false);
  assert.deepEqual(deleted, [owned]);
});

test("new owned Blob is cleaned after database failure without deleting the previous image", async () => {
  const deleted: string[] = [];
  const remove = async (url: string | string[]) => { deleted.push(...(Array.isArray(url) ? url : [url])); };
  const previous = "https://store.public.blob.vercel-storage.com/profiles/user/old.jpg";
  const submitted = "https://store.public.blob.vercel-storage.com/profiles/user/new.jpg";
  assert.equal(await deleteNewBlobAfterFailedSave(submitted, previous, remove), true);
  assert.equal(await deleteNewBlobAfterFailedSave(previous, previous, remove), false);
  assert.deepEqual(deleted, [submitted]);
});
