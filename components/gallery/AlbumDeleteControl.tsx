"use client";
import { useState } from "react";
import { deleteAlbumAction } from "@/app/galleri/actions";

export default function AlbumDeleteControl({ albumId, title, imageCount, videoCount }: { albumId: string; title: string; imageCount: number; videoCount: number }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"detach" | "permanent">("detach");
  const total = imageCount + videoCount;
  return <>
    <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-red-400/30 px-4 py-2 text-sm font-black text-red-200 transition hover:bg-red-400/10">Slet album</button>
    {open ? <div role="dialog" aria-modal="true" aria-labelledby={`delete-${albumId}`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl rounded-[2rem] border border-white/15 bg-zinc-950 p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <h2 id={`delete-${albumId}`} className="text-2xl font-black">Slet album</h2>
        <p className="mt-2 text-zinc-400">{title}</p>
        {total === 0 ? <p className="mt-5 rounded-2xl bg-white/[0.04] p-4 text-sm text-zinc-300">Albummet er tomt og kan slettes direkte.</p> : <>
          <p className="mt-5 font-bold">Albummet indeholder {imageCount} billeder og {videoCount} videoer.</p>
          <div className="mt-4 grid gap-3">
            <label className={`cursor-pointer rounded-2xl border p-4 ${mode === "detach" ? "border-emerald-400/50 bg-emerald-400/10" : "border-white/10"}`}><input type="radio" checked={mode === "detach"} onChange={() => setMode("detach")} className="mr-3"/><span className="font-black">Bevar medier (anbefalet)</span><span className="mt-1 block text-sm text-zinc-400">Slet kun albummet. Alle billeder og videoer flyttes til Uden album, og deres Blob-filer røres ikke.</span></label>
            <label className={`cursor-pointer rounded-2xl border p-4 ${mode === "permanent" ? "border-red-400/50 bg-red-400/10" : "border-white/10"}`}><input type="radio" checked={mode === "permanent"} onChange={() => setMode("permanent")} className="mr-3"/><span className="font-black text-red-200">Slet album og alle medier permanent</span><span className="mt-1 block text-sm text-zinc-400">Medierecords slettes. Kun ejede Blob-filer ryddes op efter databasecommit.</span></label>
          </div>
        </>}
        <form action={deleteAlbumAction.bind(null, albumId)} className="mt-5">
          <input type="hidden" name="mode" value={total === 0 ? "detach" : mode}/>
          {total > 0 && mode === "permanent" ? <label className="grid gap-2"><span className="text-sm font-black text-red-200">Skriv SLET PERMANENT for at fortsætte</span><input name="confirmation" autoComplete="off" className="rounded-2xl border border-red-400/30 bg-black px-4 py-3 text-white outline-none focus:border-red-300"/></label> : null}
          <div className="mt-5 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-full border border-white/15 px-5 py-2.5 font-black">Annuller</button><button className="rounded-full bg-red-300 px-5 py-2.5 font-black text-black">{total === 0 ? "Slet album" : mode === "detach" ? "Slet album og bevar medier" : "Slet permanent"}</button></div>
        </form>
      </div>
    </div> : null}
  </>;
}
