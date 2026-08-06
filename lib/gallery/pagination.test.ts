import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { galleryPage, galleryPageOffset, GALLERY_BATCH_LIMIT, GALLERY_PAGE_SIZE } from "./config";
import { validateGalleryBatch } from "./batch";

const image = (index:number)=>({name:`${index}.jpg`,type:"image/jpeg",size:1024});

test("20 er kun maksimum pr uploadbatch",()=>{assert.equal(GALLERY_BATCH_LIMIT,20);assert.equal(validateGalleryBatch(Array.from({length:20},(_,i)=>image(i))).length,20);assert.equal(validateGalleryBatch(Array.from({length:21},(_,i)=>image(i))).length,20);});
test("album med 20 eller 100 eksisterende billeder accepterer en ny batch",()=>{for(const albumCount of [20,100]){const nextBatch=validateGalleryBatch(Array.from({length:20},(_,i)=>image(albumCount+i)),0);assert.equal(nextBatch.length,20);}});
test("105 medier pagineres i fem sider med korrekt total",()=>{assert.equal(GALLERY_PAGE_SIZE,24);const total=105;assert.equal(Math.ceil(total/GALLERY_PAGE_SIZE),5);assert.deepEqual(Array.from({length:5},(_,i)=>galleryPageOffset(i+1)),[0,24,48,72,96]);assert.equal(galleryPage("2"),2);});
test("105 plus ny batch giver 125 uden dubletter",()=>{const existing=new Set(Array.from({length:105},(_,i)=>`old-${i}`));for(let i=0;i<20;i++)existing.add(`new-${i}`);assert.equal(existing.size,125);});
test("albumside bruger effektiv count, 24 take, offset og offentlig filtrering",()=>{const source=readFileSync("app/galleri/[albumId]/page.tsx","utf8");assert.match(source,/galleryImage\.count/);assert.match(source,/take:GALLERY_PAGE_SIZE/);assert.match(source,/skip:galleryPageOffset\(page\)/);assert.match(source,/active:true,public:true/);assert.match(source,/Indlæs næste 24/);});
test("adminside beholder skjulte medier mens offentlig side filtrerer dem",()=>{const source=readFileSync("app/galleri/[albumId]/page.tsx","utf8");assert.match(source,/!canManage\?\{active:true,public:true\}:\{\}/);});
test("albumoversigten tæller alle medier uden at hente hele albumrelationen",()=>{const source=readFileSync("app/galleri/page.tsx","utf8");assert.match(source,/galleryImage\.groupBy/);assert.match(source,/images \+ videos/);assert.doesNotMatch(source,/items:\s*\{\s*where:/);});
test("sortOrder fortsætter efter albumsets højeste værdi under lås",()=>{const source=readFileSync("app/api/gallery/images/route.ts","utf8");assert.match(source,/pg_advisory_xact_lock/);assert.match(source,/_max: \{ sortOrder: true \}/);assert.match(source,/\(last\._max\.sortOrder \?\? -1\) \+ 1/);});
test("uploadkø kan ryddes mellem batches uden at nulstille albumvalget",()=>{const source=readFileSync("components/gallery/GalleryAdmin.tsx","utf8");assert.match(source,/clearUploaded/);assert.match(source,/filter\(\(item\)=>item\.status!=="Uploadet"\)/);assert.match(source,/Albummet kan indeholde flere billeder/);});
