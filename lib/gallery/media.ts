export function normalizeExternalVideoUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (!["youtube.com", "youtu.be", "vimeo.com", "twitch.tv", "streamable.com"].some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) return null;
    return url.toString();
  } catch { return null; }
}

export function visibleGalleryItems<T extends { active: boolean; public: boolean; sortOrder: number; createdAt: Date }>(items: T[]) {
  return items.filter((item) => item.active && item.public).sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt.getTime() - a.createdAt.getTime());
}
