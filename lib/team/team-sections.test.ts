import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/team/page.tsx", "utf8");
const actions = readFileSync("app/team/actions.ts", "utf8");
const migration = readFileSync("prisma/migrations/20260802120000_add_team_sections/migration.sql", "utf8");

test("teamkort centreres responsivt for en, to, tre og flere medlemmer", () => {
  assert.match(page, /flex flex-wrap justify-center gap-6/);
  assert.match(page, /w-full min-w-0 max-w-\[320px\]/);
  assert.match(page, /overflow-x-hidden/);
});

test("admin kan administrere sektioner og flytte medlemmer", () => {
  assert.match(page, /action=\{saveTeamSectionAction\}/);
  assert.match(page, /name="sectionId"/);
  assert.match(page, /Ingen sektion/);
  assert.match(actions, /sectionExists/);
});

test("sletning kræver bekræftelse og relationen bevarer medlemmer", () => {
  assert.match(actions, /confirmDelete/);
  assert.match(migration, /ON DELETE SET NULL/);
  assert.doesNotMatch(actions, /teamMember\.deleteMany/);
});

test("migrationen opretter standardsektioner og mapper eksisterende roller", () => {
  for (const section of ["Founders", "Management", "Staff", "Security"]) assert.match(migration, new RegExp(`'${section}'`));
  assert.match(migration, /LOWER\("roleTitle"\)/);
  assert.match(migration, /ELSE 'team-section-staff'/);
});
