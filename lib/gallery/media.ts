export function normalizeExternalVideoUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (!["youtube.com", "youtu.be", "vimeo.com", "twitch.tv", "streamable.com"].some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) return null;
    return url.toString();
  } catch { return null; }
}

export function externalVideoEmbedUrl(value: string) {
  const normalized = normalizeExternalVideoUrl(value);
  if (!normalized) return null;
  const url = new URL(normalized);
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${url.pathname.split("/").filter(Boolean)[0] ?? ""}`;
  if (host.endsWith("youtube.com")) {
    const id = url.searchParams.get("v") || url.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/)?.[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host.endsWith("vimeo.com")) {
    const id = url.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (host.endsWith("streamable.com")) {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ? `https://streamable.com/e/${id}` : null;
  }
  return null; // Twitch requires a runtime parent hostname; retain the safe fallback link.
}

export function visibleGalleryItems<T extends { active: boolean; public: boolean; sortOrder: number; createdAt: Date }>(items: T[]) {
  return items.filter((item) => item.active && item.public).sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt.getTime() - a.createdAt.getTime());
}
