import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("nye albums og enkeltmedier tvinges aktive og offentlige",()=>{const source=readFileSync("app/galleri/actions.ts","utf8");assert.match(source,/active: id \? data\.get\("active"\) === "on" : true/);assert.match(source,/public: id \? data\.get\("public"\) === "on" : true/);});
test("batchupload gemmer gyldige billeder aktive og offentlige uden godkendelsesstatus",()=>{const source=readFileSync("app/api/gallery/images/route.ts","utf8");assert.match(source,/active: true, public: true/);assert.doesNotMatch(source,/PENDING|Afventer godkendelse/);});
test("upload-UI forklarer øjeblikkelig publicering",()=>{const source=readFileSync("components/gallery/GalleryAdmin.tsx","utf8");assert.match(source,/Gyldige billeder bliver offentliggjort med det samme/);});
