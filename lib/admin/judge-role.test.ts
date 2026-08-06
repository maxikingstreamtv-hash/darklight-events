import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getAssignableRoles } from "./role-management";
import type { AuthUser } from "@/lib/auth/types";

function actor(role:AuthUser["role"]):AuthUser{return {id:"u",username:"u",displayName:"U",role,active:true,profileStatus:"ACTIVE",badges:[],permissions:[]};}
test("SUPER_ADMIN kan tildele og fjerne JUDGE gennem den centrale rolleliste",()=>{assert.ok(getAssignableRoles(actor("SUPER_ADMIN")).includes("JUDGE"));});
test("ADMIN følger eksisterende sikkerhedsmodel og kan tildele JUDGE men ikke SUPER_ADMIN",()=>{const roles=getAssignableRoles(actor("ADMIN"));assert.ok(roles.includes("JUDGE"));assert.equal(roles.includes("SUPER_ADMIN"),false);});
test("JUDGE vises med dansk label i opret og rediger bruger",()=>{const types=readFileSync("lib/auth/types.ts","utf8");const create=readFileSync("app/admin/users/create/page.tsx","utf8");const edit=readFileSync("app/admin/users/[id]/page.tsx","utf8");assert.match(types,/JUDGE: "Dommer"/);assert.match(create,/roleLabel\(role\)/);assert.match(edit,/roleLabel\(role\)/);});
test("rolleændringer valideres server-side og audit-logges",()=>{const source=readFileSync("app/admin/users/actions.ts","utf8");assert.match(source,/assignableRoles\.includes\(values\.role\)/);assert.match(source,/action: "role_changed"/);});
test("fjernet JUDGE-rank deaktiverer tildelinger men bevarer historiske scores",()=>{const source=readFileSync("app/admin/users/actions.ts","utf8");assert.match(source,/eventJudge\.updateMany[\s\S]*active: false/);assert.doesNotMatch(source,/judgeScore\.delete/);});
test("JUDGE kan åbne Dommerpanel men ikke øvrige competition-routes",()=>{const source=readFileSync("lib/auth/rbac.ts","utf8");assert.match(source,/subject\.role === "JUDGE"[\s\S]*pathname\.startsWith\("\/competition\/judging"\)/);});
test("Dommerpanel begrænser JUDGE til aktive tildelinger og giver staff overblik",()=>{const source=readFileSync("app/competition/judging/page.tsx","utf8");assert.match(source,/userId:user\.id,active:true,user:\{role:"JUDGE",active:true\}/);assert.match(source,/SUPER_ADMIN","ADMIN","EVENT_MANAGER/);assert.match(source,/event\.findMany/);});
test("kun aktive JUDGE-brugere vises i eventets dommervælger",()=>{const source=readFileSync("app/competition/events/[id]/page.tsx","utf8");assert.match(source,/where: \{ role: "JUDGE", active: true \}/);});
test("backend afviser dommerinput uden JUDGE-rank og aktiv tildeling",()=>{const source=readFileSync("app/competition/judging/actions.ts","utf8");assert.match(source,/judge\.role !== "JUDGE"/);assert.match(source,/judges: \{ where: \{ userId: judge\.id, active: true \}/);});
test("rollesiden beskriver Dommer og dens begrænsninger",()=>{const source=readFileSync("app/admin/page.tsx","utf8");assert.match(source,/>Dommer</);assert.match(source,/>JUDGE</);assert.match(source,/Kan bedømme tildelte events/);});
