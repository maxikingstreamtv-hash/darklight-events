import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { GALLERY_MAX_IMAGE_BYTES, galleryUploadPath, hasValidImageSignature, isExpectedGalleryBlob, parseApiResponse, parseGalleryUploadPayload } from "./direct-upload";
import { runWithConcurrency } from "./batch";

const payload = (size: number) => JSON.stringify({ albumId: "album_1", eventId: null, uploadKey: "key_1", filename: "foto.jpg", contentType: "image/jpeg", size });

for (const [label, size] of [["4,3 MB", Math.floor(4.3*1024*1024)], ["4,8 MB", Math.floor(4.8*1024*1024)], ["7,5 MB", Math.floor(7.5*1024*1024)], ["præcis 8 MB", 8*1024*1024]] as const) {
  test(`${label} accepteres af gallery direct upload`, () => assert.equal(parseGalleryUploadPayload(payload(size)).size, size));
}
test("over 8 MB afvises med den danske fejl", () => assert.throws(()=>parseGalleryUploadPayload(payload(GALLERY_MAX_IMAGE_BYTES+1)), /maksimalt fylde 8 MB/));
test("Blob path bestemmes kanonisk fra album uploadKey og saniteret navn",()=>assert.equal(galleryUploadPath(JSON.parse(payload(100))),"gallery/album_1/key_1-foto.jpg"));
test("kun forventet project Blob URL og pathname accepteres",()=>{assert.equal(isExpectedGalleryBlob("https://store.public.blob.vercel-storage.com/gallery/album_1/key_1-foto.jpg","gallery/album_1/key_1-foto.jpg"),true);assert.equal(isExpectedGalleryBlob("https://example.com/gallery/album_1/key_1-foto.jpg","gallery/album_1/key_1-foto.jpg"),false);});
test("JPG PNG og WebP signatures valideres fra de første 12 bytes",()=>{assert.equal(hasValidImageSignature("image/jpeg",new Uint8Array([255,216,255])),true);assert.equal(hasValidImageSignature("image/png",new Uint8Array([137,80,78,71,13,10,26,10])),true);assert.equal(hasValidImageSignature("image/webp",new TextEncoder().encode("RIFFxxxxWEBP")),true);});
test("tekst og HTML API-fejl giver kontrolleret fejl uden JSON parser exception",async()=>{const html=await parseApiResponse(new Response("<html>413</html>",{status:413,headers:{"content-type":"text/html"}}));assert.match(html.error||"",/afviste/);const empty=await parseApiResponse(new Response(null,{status:503}));assert.match(empty.error||"",/svarede ikke/);});
for (const concurrency of [1,2,3]) test(`20 billeder er stabile ved concurrency ${concurrency}`,async()=>{let active=0,max=0,done=0;await runWithConcurrency(Array.from({length:20},(_,i)=>i),concurrency,async(i)=>{active++;max=Math.max(max,active);await new Promise(r=>setTimeout(r,2));active--;if(i===7) return;done++;});assert.equal(max,concurrency);assert.equal(done,19);});
test("gallery filbytes går til Blob client og finalize sender JSON",()=>{const ui=readFileSync("components/gallery/GalleryAdmin.tsx","utf8");const finalize=readFileSync("app/api/gallery/images/route.ts","utf8");assert.match(ui,/uploadToBlob/);assert.match(ui,/content-type": "application\/json/);assert.doesNotMatch(finalize,/request\.formData\(\)|instanceof File/);});
test("token route håndhæver RBAC størrelse type album og serverkontrolleret path",()=>{const route=readFileSync("app/api/gallery/images/upload/route.ts","utf8");assert.match(route,/isGalleryManager/);assert.match(route,/maximumSizeInBytes: GALLERY_MAX_IMAGE_BYTES/);assert.match(route,/allowedContentTypes: \[payload\.contentType\]/);assert.match(route,/pathname !== galleryUploadPath\(payload\)/);assert.match(route,/galleryAlbum\.findUnique/);});
test("finalize bevarer uploadKey idempotency og rydder Blob efter databasefejl",()=>{const route=readFileSync("app/api/gallery/images/route.ts","utf8");assert.match(route,/findUnique\(\{ where: \{ uploadKey: payload\.uploadKey \} \}\)/);assert.match(route,/deleteNewBlobAfterFailedSave/);assert.match(route,/head\(blobUrl\)/);assert.match(route,/Range: "bytes=0-11"/);});
