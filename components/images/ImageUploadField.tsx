"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import {
  IMAGE_MIME_TYPES,
  imageSizeLabel,
  type ImageUploadScope,
  validateImageFileMetadata,
} from "@/lib/images/image-upload";

type ImageVariant = "avatar" | "logo" | "cover";

export default function ImageUploadField({
  name,
  scope,
  ownerId,
  initialUrl = "",
  value,
  label,
  chooseLabel,
  helpText,
  variant = "cover",
  allowExternalUrl = false,
  disabled = false,
  onValueChange,
}: {
  name?: string;
  scope: ImageUploadScope;
  ownerId?: string;
  initialUrl?: string;
  value?: string;
  label: string;
  chooseLabel: string;
  helpText: string;
  variant?: ImageVariant;
  allowExternalUrl?: boolean;
  disabled?: boolean;
  onValueChange?: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalUrl, setInternalUrl] = useState(initialUrl);
  const url = value ?? internalUrl;
  const [preview, setPreview] = useState(initialUrl);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showExternal, setShowExternal] = useState(false);

  useEffect(() => () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  function updateUrl(nextUrl: string) {
    if (value === undefined) setInternalUrl(nextUrl);
    onValueChange?.(nextUrl);
  }

  async function upload(file: File) {
    try {
      validateImageFileMetadata(file, scope);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Billedet er ugyldigt.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setStatus("uploading");
    setMessage("Uploader…");
    const body = new FormData();
    body.set("file", file);
    body.set("scope", scope);
    if (ownerId) body.set("ownerId", ownerId);

    try {
      const response = await fetch("/api/images", { method: "POST", body });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error ?? "Upload fejlede.");
      updateUrl(result.url);
      setPreview(result.url);
      setStatus("success");
      setMessage("Billedet er uploadet.");
    } catch (error) {
      updateUrl(initialUrl);
      setPreview(initialUrl);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Billedet kunne ikke uploades.");
    }
  }

  function remove() {
    updateUrl("");
    setPreview("");
    setStatus("idle");
    setMessage("Billedet fjernes, når formularen gemmes.");
    if (inputRef.current) inputRef.current.value = "";
  }

  const frameClass =
    variant === "avatar"
      ? "aspect-square w-36 rounded-full"
      : variant === "logo"
        ? "aspect-video w-full rounded-2xl p-5"
        : "aspect-video w-full rounded-2xl";
  const imageClass = variant === "logo" ? "object-contain" : "object-cover";

  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-black/70 p-4">
      {name ? <input name={name} type="hidden" value={url} /> : null}
      <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <div
        className={`relative mt-3 overflow-hidden border border-white/10 bg-zinc-950 ${frameClass}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file && !disabled && status !== "uploading") void upload(file);
        }}
      >
        {preview ? (
          <img src={preview} alt={`Preview: ${label}`} className={`h-full w-full ${imageClass}`} />
        ) : (
          <div className="flex h-full min-h-28 items-center justify-center px-4 text-center text-sm font-black text-zinc-600">
            {variant === "avatar" ? "DL" : "DarkLight"}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-black text-black transition hover:bg-zinc-300">
          {status === "uploading" ? "Uploader…" : url ? "Udskift billede" : chooseLabel}
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_MIME_TYPES.join(",")}
            className="sr-only"
            disabled={disabled || status === "uploading"}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
        </label>
        {preview ? (
          <button type="button" onClick={remove} disabled={disabled || status === "uploading"} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-black text-zinc-200 disabled:opacity-50">
            Fjern billede
          </button>
        ) : null}
        {allowExternalUrl ? (
          <button type="button" onClick={() => setShowExternal((current) => !current)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-400">
            Brug ekstern billed-URL
          </button>
        ) : null}
      </div>
      {allowExternalUrl && showExternal ? (
        <label className="mt-4 grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Ekstern billed-URL</span>
          <input
            type="url"
            value={url}
            onChange={(event) => {
              updateUrl(event.target.value);
              setPreview(event.target.value);
            }}
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white"
            placeholder="https://…"
          />
        </label>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-zinc-500">{helpText} JPG, PNG eller WebP · maks. {imageSizeLabel(scope)}.</p>
      <p aria-live="polite" className={`mt-2 text-sm ${status === "error" ? "text-red-300" : status === "success" ? "text-emerald-300" : "text-zinc-500"}`}>
        {message || "Du kan også trække et billede hertil."}
      </p>
    </section>
  );
}
