import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTeamSkills, visibleTeamMembers } from "./team-members";
test("tags trimmes og deduplikeres", () => assert.deepEqual(normalizeTeamSkills("DJ, Host, dj,  "), ["DJ","Host"]));
test("inaktive teammedlemmer skjules og sortOrder bruges", () => { const rows=visibleTeamMembers([{name:"B",active:true,sortOrder:2},{name:"A",active:true,sortOrder:1},{name:"X",active:false,sortOrder:0}]); assert.deepEqual(rows.map((row)=>row.name),["A","B"]); });
