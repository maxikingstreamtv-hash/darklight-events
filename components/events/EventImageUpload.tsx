"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { clampEventImageFocus, eventImageObjectPosition } from "@/lib/events/event-images";

export default function EventImageUpload({
  eventId = "draft",
  initialUrl = "",
  configured = true,
  initialFocusX = 50,
  initialFocusY = 50,
}: {
  eventId?: string;
  initialUrl?: string;
  configured?: boolean;
  initialFocusX?: number;
  initialFocusY?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [preview, setPreview] = useState(initialUrl);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [focusX, setFocusX] = useState(clampEventImageFocus(initialFocusX));
  const [focusY, setFocusY] = useState(clampEventImageFocus(initialFocusY));

  useEffect(() => () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  async function upload(file: File) {
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setStatus("uploading");
    setMessage("Uploader billede…");
    const body = new FormData();
    body.set("file", file);
    body.set("eventId", eventId);
    try {
      const response = await fetch("/api/events/image", { method: "POST", body });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Upload fejlede.");
      setUrl(result.url);
      setPreview(result.url);
      setStatus("success");
      setMessage("Billedet er uploadet permanent og klar til at blive gemt.");
    } catch (error) {
      setUrl("");
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Billedet kunne ikke uploades.");
    }
  }

  function remove() {
    setUrl("");
    setPreview("");
    setFocusX(50);
    setFocusY(50);
    setStatus("idle");
    setMessage("Billedet fjernes, når eventet gemmes.");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-black p-5">
      <input name="imageUrl" type="hidden" value={url} />
      <input name="imageFocusX" type="hidden" value={focusX} />
      <input name="imageFocusY" type="hidden" value={focusY} />
      <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Eventbillede</p>
      {preview ? (
        <div
          className="relative mt-4 aspect-video w-full cursor-crosshair overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
          onClick={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            setFocusX(clampEventImageFocus(((event.clientX - bounds.left) / bounds.width) * 100));
            setFocusY(clampEventImageFocus(((event.clientY - bounds.top) / bounds.height) * 100));
          }}
        >
          <img src={preview} alt="Preview af eventbillede" className="h-full w-full object-contain" />
          <span className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white shadow" style={{ left: `${focusX}%`, top: `${focusY}%` }} />
        </div>
      ) : (
        <div className="mt-4 flex h-52 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)] text-sm font-black text-zinc-500">
          DarkLight Events
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-black text-black transition hover:bg-zinc-300">
          {url ? "Skift billede" : "Vælg billede"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={status === "uploading" || !configured}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </label>
        {preview ? <button type="button" onClick={remove} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-zinc-200">Fjern billede</button> : null}
        {preview ? <button type="button" onClick={() => { setFocusX(50); setFocusY(50); }} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-zinc-200">Nulstil fokus</button> : null}
      </div>
      {preview ? <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black"><p className="px-4 pt-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Eventkort-preview</p><div className="mt-3 aspect-video overflow-hidden rounded-b-2xl"><img src={preview} alt="Eventkort-preview" className="h-full w-full object-cover" style={{ objectPosition: eventImageObjectPosition(focusX, focusY) }} /></div></div> : null}
      <p aria-live="polite" className={`mt-3 text-sm ${status === "error" ? "text-red-300" : status === "success" ? "text-emerald-300" : "text-zinc-500"}`}>
        {message || (configured ? "JPG, PNG eller WebP. Maks. 8 MB." : "Billedlager er ikke konfigureret endnu.")}
      </p>
    </section>
  );
}
