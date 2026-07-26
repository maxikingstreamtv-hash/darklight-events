import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const uploadField = readFileSync("components/images/ImageUploadField.tsx", "utf8");
const profileForm = readFileSync("components/profile/ProfileEditForm.tsx", "utf8");
const sponsorForm = readFileSync("components/competition/SponsorDbManagerPanel.tsx", "utf8");
const uploadRoute = readFileSync("app/api/images/route.ts", "utf8");

test("shared field provides upload, preview, removal, drag-and-drop and fallback UX", () => {
  for (const marker of ["type=\"file\"", "onDrop=", "Uploader…", "Billedet er uploadet.", "Fjern billede", "DarkLight"]) {
    assert.equal(uploadField.includes(marker), true, marker);
  }
});

test("profile and sponsor forms use shared upload instead of required URL-only inputs", () => {
  assert.equal(profileForm.includes("scope=\"profile\""), true);
  assert.equal(profileForm.includes("Avatar URL"), false);
  assert.equal(sponsorForm.includes("scope=\"sponsor\""), true);
  assert.equal(sponsorForm.includes("Logo URL"), false);
});

test("server upload route enforces authentication and scope RBAC", () => {
  assert.equal(uploadRoute.includes("Du skal være logget ind"), true);
  assert.equal(uploadRoute.includes("Du må kun ændre dit eget profilbillede"), true);
  assert.equal(uploadRoute.includes("Du har ikke adgang til sponsorlogoer"), true);
  assert.equal(uploadRoute.includes("validateImageFile(file, scope)"), true);
});
