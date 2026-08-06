import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { albumDeletionValidation, ownedAlbumBlobUrls } from "./album-deletion";
import { isGalleryManager } from "./config";

test("empty albums need no permanent phrase", () => {
  assert.equal(albumDeletionValidation(0, true, ""), null);
});

test("albums with media require the exact permanent phrase", () => {
  assert.match(albumDeletionValidation(2, true, "forkert")!, /SLET PERMANENT/);
  assert.equal(albumDeletionValidation(2, true, " SLET PERMANENT "), null);
  assert.equal(albumDeletionValidation(2, false, ""), null);
});

test("owned Blob URLs are deduplicated and external URLs are excluded", () => {
  const owned = "https://store.public.blob.vercel-storage.com/gallery/a/image.jpg";
  assert.deepEqual(ownedAlbumBlobUrls([
    { imageUrl: owned, thumbnailUrl: owned },
    { imageUrl: "https://images.example.com/external.jpg", thumbnailUrl: "https://youtube.com/thumb.jpg" },
  ]), [owned]);
});

test("preserve-media flow performs no Blob cleanup while permanent cleanup includes cover once", () => {
  const source = readFileSync("app/galleri/actions.ts", "utf8");
  assert.match(source, /const urls = permanent \? ownedAlbumBlobUrls\(\[\.\.\.album\.items, \{ imageUrl: album\.coverImageUrl/);
  assert.doesNotMatch(source.slice(source.indexOf("deleteAlbumAction"), source.indexOf("createVideoBatchAction")), /deleteReplacedBlobImage\(album\.coverImageUrl/);
});

test("album deletion RBAC permits managers and rejects USER", () => {
  assert.equal(isGalleryManager("SUPER_ADMIN"), true);
  assert.equal(isGalleryManager("ADMIN"), true);
  assert.equal(isGalleryManager("EVENT_MANAGER"), true);
  assert.equal(isGalleryManager("USER"), false);
});

test("delete action detaches or permanently deletes inside a transaction before Blob cleanup", () => {
  const source = readFileSync("app/galleri/actions.ts", "utf8");
  const transaction = source.indexOf("await prisma.$transaction", source.indexOf("deleteAlbumAction"));
  const blobCleanup = source.indexOf("await Promise.all(urls.map", transaction);
  assert.match(source.slice(transaction, blobCleanup), /galleryImage\.updateMany[\s\S]*albumId: null/);
  assert.match(source.slice(transaction, blobCleanup), /galleryImage\.deleteMany/);
  assert.match(source.slice(transaction, blobCleanup), /galleryAlbum\.delete/);
  assert.ok(transaction >= 0 && blobCleanup > transaction);
  assert.match(source, /catch[\s\S]*Albummet kunne ikke slettes/);
});

test("delete action has inline feedback and all targeted revalidation", () => {
  const source = readFileSync("app/galleri/actions.ts", "utf8");
  for (const message of ["Du har ikke adgang til at slette albums.", "Albummet findes ikke længere.", "Albummet blev slettet.", "Medierne blev flyttet til Uden album.", "Albummet og medierne blev slettet permanent."]) assert.match(source, new RegExp(message.replace(/[.]/g, "\\.")));
  assert.match(source, /revalidatePath\("\/galleri"\)/);
  assert.match(source, /revalidatePath\("\/galleri\/uden-album"\)/);
  assert.match(source, /revalidatePath\(`\/galleri\/\$\{id\}`\)/);
  assert.match(source, /revalidatePath\(`\/events\/\$\{id\}`\)/);
  assert.doesNotMatch(source.slice(source.indexOf("deleteAlbumAction"), source.indexOf("createVideoBatchAction")), /event\.delete|user\.delete|sponsor\.delete/);
});

test("album cards expose edit and safe delete controls", () => {
  const page = readFileSync("app/galleri/page.tsx", "utf8");
  const control = readFileSync("components/gallery/AlbumDeleteControl.tsx", "utf8");
  assert.match(page, /Redigér/);
  assert.match(page, /AlbumDeleteControl/);
  assert.match(control, /Bevar medier \(anbefalet\)/);
  assert.match(control, /SLET PERMANENT/);
  assert.match(control, /total === 0/);
});
