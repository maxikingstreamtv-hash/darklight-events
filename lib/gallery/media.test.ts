import assert from "node:assert/strict";
import test from "node:test";
import { normalizeExternalVideoUrl, visibleGalleryItems } from "./media";
test("godkendte videotjenester accepteres", () => { assert.match(normalizeExternalVideoUrl("https://youtube.com/watch?v=abc") ?? "", /youtube/); assert.equal(normalizeExternalVideoUrl("https://example.com/video"), null); });
test("skjulte og inaktive medier filtreres", () => { const now=new Date(); const visible=visibleGalleryItems([{id:"a",active:true,public:true,sortOrder:2,createdAt:now},{id:"b",active:false,public:true,sortOrder:1,createdAt:now}]); assert.deepEqual(visible.map((item)=>item.id),["a"]); });
