import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTeamSkills, publicTeamSections, teamSectionSlug, visibleTeamMembers } from "./team-members";
test("tags trimmes og deduplikeres", () => assert.deepEqual(normalizeTeamSkills("DJ, Host, dj,  "), ["DJ","Host"]));
test("inaktive teammedlemmer skjules og sortOrder bruges", () => { const rows=visibleTeamMembers([{name:"B",active:true,sortOrder:2},{name:"A",active:true,sortOrder:1},{name:"X",active:false,sortOrder:0}]); assert.deepEqual(rows.map((row)=>row.name),["A","B"]); });

test("offentlige teamsektioner og medlemmer sorteres, mens tomme og skjulte sektioner fjernes", () => {
  const sections = publicTeamSections([
    { id: "security", name: "Security", description: null, isPublic: true, sortOrder: 4, members: [{ name: "Guard", active: true, sortOrder: 1 }] },
    { id: "empty", name: "Empty", description: null, isPublic: true, sortOrder: 0, members: [] },
    { id: "staff", name: "Staff", description: null, isPublic: true, sortOrder: 3, members: [{ name: "Hidden", active: false, sortOrder: 0 }, { name: "B", active: true, sortOrder: 2 }, { name: "A", active: true, sortOrder: 1 }] },
    { id: "management", name: "Management", description: null, isPublic: true, sortOrder: 2, members: [{ name: "Manager", active: true, sortOrder: 1 }] },
    { id: "founders", name: "Founders", description: null, isPublic: true, sortOrder: 1, members: [{ name: "Founder", active: true, sortOrder: 1 }] },
    { id: "private", name: "Private", description: null, isPublic: false, sortOrder: 0, members: [{ name: "Secret", active: true, sortOrder: 1 }] },
  ]);
  assert.deepEqual(sections.map((section) => section.name), ["Founders", "Management", "Staff", "Security"]);
  assert.deepEqual(sections[2].members.map((member) => member.name), ["A", "B"]);
});

test("teamsektionens slug normaliseres sikkert", () => {
  assert.equal(teamSectionSlug("  Sikkerhed & Værter  "), "sikkerhed-vaerter");
  assert.equal(teamSectionSlug("***"), "sektion");
});
