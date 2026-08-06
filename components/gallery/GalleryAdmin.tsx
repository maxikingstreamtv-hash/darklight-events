"use client";
/* eslint-disable @next/next/no-img-element */
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload as uploadToBlob } from "@vercel/blob/client";
import { GALLERY_BATCH_LIMIT, GALLERY_UPLOAD_CONCURRENCY } from "@/lib/gallery/config";
import { validateImageFileMetadata } from "@/lib/images/image-upload";
import { galleryUploadPath, isRetryableUploadStatus, parseApiResponse, type GalleryUploadPayload } from "@/lib/gallery/direct-upload";
import { runWithConcurrency } from "@/lib/gallery/batch";
import { createVideoBatchAction, saveAlbumAction } from "@/app/galleri/actions";

type Option = { id: string; title: string };
type QueueItem = { id: string; file: File; preview: string; status: "Klar" | "Uploader" | "Uploadet" | "Fejlet"; error?: string; blobUrl?: string };
const field = "w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white";

export default function GalleryAdmin({ albums, events, defaultAlbumId = "" }: { albums: Option[]; events: Option[]; defaultAlbumId?: string }) {
  const router = useRouter(); const input = useRef<HTMLInputElement>(null); const uploadedBlobUrls = useRef(new Map<string,string>()); const [panel, setPanel] = useState<"album" | "images" | "videos" | null>(null); const [queue, setQueue] = useState<QueueItem[]>([]); const [albumId, setAlbumId] = useState(defaultAlbumId); const [eventId, setEventId] = useState(""); const [prefix, setPrefix] = useState(""); const [description, setDescription] = useState(""); const [running, setRunning] = useState(false);
  const uploaded = queue.filter((item) => item.status === "Uploadet").length; const failed = queue.filter((item) => item.status === "Fejlet").length;
  function addFiles(list: FileList | File[]) { const files = Array.from(list); const room = GALLERY_BATCH_LIMIT - queue.length; const added = files.slice(0, room).map((file) => { try { validateImageFileMetadata(file, "gallery"); return { id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), status: "Klar" as const }; } catch (error) { return { id: crypto.randomUUID(), file, preview: "", status: "Fejlet" as const, error: error instanceof Error ? error.message : "Ugyldig fil." }; } }); setQueue((current) => [...current, ...added]); }
  async function upload(item: QueueItem) {
    setQueue((q) => q.map((x) => x.id === item.id ? { ...x, status: "Uploader", error: undefined } : x));
    const payload: GalleryUploadPayload = { albumId: albumId || null, eventId: eventId || null, uploadKey: item.id, filename: item.file.name, contentType: item.file.type as GalleryUploadPayload["contentType"], size: item.file.size };
    let lastError = "Upload fejlede.";
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        let currentBlobUrl = uploadedBlobUrls.current.get(item.id) || item.blobUrl;
        if (!currentBlobUrl) {
          const blob = await uploadToBlob(galleryUploadPath(payload), item.file, { access: "public", handleUploadUrl: "/api/gallery/images/upload", clientPayload: JSON.stringify(payload), contentType: item.file.type, multipart: false });
          currentBlobUrl = blob.url;
          uploadedBlobUrls.current.set(item.id, currentBlobUrl);
          setQueue((q) => q.map((x) => x.id === item.id ? { ...x, blobUrl: currentBlobUrl } : x));
        }
        const response = await fetch("/api/gallery/images", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, blobUrl: currentBlobUrl, titlePrefix: prefix, description }) });
        const result = await parseApiResponse(response);
        if (!response.ok) {
          lastError = result.error || "Upload fejlede.";
          if (!isRetryableUploadStatus(response.status)) throw Object.assign(new Error(lastError), { uploadedGone: true });
          throw Object.assign(new Error(lastError), { retryable: true });
        }
        setQueue((q) => q.map((x) => x.id === item.id ? { ...x, status: "Uploadet", error: undefined, blobUrl: currentBlobUrl } : x));
        return;
      } catch (error) {
        const retryable = error instanceof TypeError || (error instanceof Error && "retryable" in error);
        if (error instanceof Error && "uploadedGone" in error) uploadedBlobUrls.current.delete(item.id);
        lastError = error instanceof Error ? error.message : lastError;
        if (!retryable || attempt === 2) break;
        await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
      }
    }
    setQueue((q) => q.map((x) => x.id === item.id ? { ...x, status: "Fejlet", error: lastError, blobUrl: uploadedBlobUrls.current.get(item.id) || item.blobUrl } : x));
  }
  async function run(items = queue.filter((item) => item.status === "Klar")) { if (!items.length) return; setRunning(true); await runWithConcurrency(items, GALLERY_UPLOAD_CONCURRENCY, upload); setRunning(false); router.refresh(); }
  function clearUploaded() { setQueue((current)=>current.filter((item)=>item.status!=="Uploadet")); if(input.current) input.current.value=""; }
  const summary = useMemo(() => `${uploaded} af ${queue.length} billeder uploadet${failed ? ` · ${failed} fejlede` : ""}`, [uploaded, failed, queue.length]);
  return <section id="media-admin" className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
    <p className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-100">Gyldige billeder bliver offentliggjort med det samme.</p>
    <div className="flex flex-wrap gap-3"><button onClick={() => setPanel("album")} className="rounded-full bg-white px-5 py-3 font-black text-black">Opret album</button><button onClick={() => setPanel("images")} className="rounded-full border border-white/15 px-5 py-3 font-black">Upload billeder</button><button onClick={() => setPanel("videos")} className="rounded-full border border-white/15 px-5 py-3 font-black">Tilføj videoer</button></div>
    {panel === "album" ? <form action={saveAlbumAction} className="mt-6 grid gap-4 md:grid-cols-2"><input name="title" required placeholder="Albumnavn" className={field}/><select name="eventId" className={field}><option value="">Intet event</option>{events.map((e)=><option key={e.id} value={e.id}>{e.title}</option>)}</select><textarea name="description" placeholder="Beskrivelse (valgfri)" className={`${field} md:col-span-2`}/><input name="sortOrder" type="number" defaultValue="0" className={field}/><p className="text-sm text-zinc-400 md:col-span-2">Albummet oprettes aktivt og offentligt. Det kan skjules bagefter.</p><button className="rounded-full bg-white px-5 py-3 font-black text-black">Opret album</button></form> : null}
    {panel === "images" ? <div className="mt-6"><div className="grid gap-4 md:grid-cols-2"><select value={albumId} onChange={(e)=>setAlbumId(e.target.value)} className={field}><option value="">Uden album</option>{albums.map((a)=><option key={a.id} value={a.id}>{a.title}</option>)}</select><select value={eventId} onChange={(e)=>setEventId(e.target.value)} className={field}><option value="">Intet event</option>{events.map((e)=><option key={e.id} value={e.id}>{e.title}</option>)}</select><input value={prefix} onChange={(e)=>setPrefix(e.target.value)} placeholder="Fælles titelprefix (valgfrit)" className={field}/><input value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Fælles beskrivelse (valgfri)" className={field}/></div><div onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{e.preventDefault(); addFiles(e.dataTransfer.files);}} className="mt-4 rounded-2xl border border-dashed border-white/20 p-8 text-center"><p className="font-black">Træk op til {GALLERY_BATCH_LIMIT} JPG-, PNG- eller WebP-filer hertil</p><p className="mt-2 text-sm text-zinc-500">Maks. 8 MB pr. billede · højst {GALLERY_UPLOAD_CONCURRENCY} samtidige uploads</p><p className="mt-2 text-sm text-zinc-400">Du kan vælge op til 20 billeder pr. upload. Albummet kan indeholde flere billeder; upload blot flere batches.</p><button type="button" onClick={()=>input.current?.click()} className="mt-4 rounded-full bg-white px-5 py-2.5 font-black text-black">Vælg flere filer</button><input ref={input} multiple type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e)=>e.target.files&&addFiles(e.target.files)}/></div><div className="mt-5 grid gap-3">{queue.map((item)=><div key={item.id} className="flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 p-3">{item.preview?<img loading="lazy" src={item.preview} alt="" className="h-16 w-20 rounded-xl object-cover"/>:<div className="h-16 w-20 rounded-xl bg-red-500/10"/>}<div className="min-w-0 flex-1"><p className="truncate font-bold">{item.file.name}</p><p className="text-xs text-zinc-500">{(item.file.size/1024/1024).toFixed(2)} MB · {item.status}</p>{item.error?<p className="text-sm text-red-300">{item.error}</p>:null}</div>{item.status === "Fejlet" && !running ? <button onClick={()=>void run([{...item,status:"Klar"}])} className="text-sm font-black">Prøv igen</button>:null}{item.status === "Klar"&&!running?<button onClick={()=>setQueue((q)=>q.filter((x)=>x.id!==item.id))} className="text-sm text-zinc-400">Fjern</button>:null}</div>)}</div>{queue.length?<div className="mt-5 flex flex-wrap items-center gap-4"><button disabled={running} onClick={()=>void run()} className="rounded-full bg-white px-5 py-3 font-black text-black disabled:opacity-50">{running?"Uploader…":"Start samlet upload"}</button>{uploaded&&!running?<button onClick={clearUploaded} className="rounded-full border border-white/15 px-5 py-3 font-black">Ryd uploadede og vælg næste batch</button>:null}{failed&&!running?<button onClick={()=>void run(queue.filter((x)=>x.status==="Fejlet").map((x)=>({...x,status:"Klar"})))} className="rounded-full border border-white/15 px-5 py-3 font-black">Prøv fejlede igen</button>:null}<p aria-live="polite" className="text-sm text-zinc-400">{summary}</p></div>:null}</div> : null}
    {panel === "videos" ? <form action={createVideoBatchAction} className="mt-6 grid gap-4 md:grid-cols-2"><select name="albumId" defaultValue={defaultAlbumId} className={field}><option value="">Uden album</option>{albums.map((a)=><option key={a.id} value={a.id}>{a.title}</option>)}</select><select name="eventId" className={field}><option value="">Intet event</option>{events.map((e)=><option key={e.id} value={e.id}>{e.title}</option>)}</select><textarea name="videos" required rows={7} placeholder={"Én URL pr. linje\neller: Titel | URL"} className={`${field} md:col-span-2`}/><textarea name="description" placeholder="Fælles beskrivelse (valgfri)" className={`${field} md:col-span-2`}/><p className="text-sm text-zinc-500 md:col-span-2">Alle links valideres samlet. Ved ugyldige linjer gemmes ingen, og linjenumrene vises.</p><button className="rounded-full bg-white px-5 py-3 font-black text-black">Tilføj videoer</button></form> : null}
  </section>;
}
