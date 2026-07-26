import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isBlobStorageConfigured, safeEventImageName, validateEventImage } from "@/lib/events/event-images";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(user.role)) {
    return NextResponse.json({ error: "Du har ikke adgang til at uploade eventbilleder." }, { status: 403 });
  }
  if (!isBlobStorageConfigured(process.env.BLOB_READ_WRITE_TOKEN)) {
    return NextResponse.json({ error: "Billedlager er ikke konfigureret endnu." }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const eventId = String(formData.get("eventId") ?? "draft").replace(/[^a-zA-Z0-9_-]/g, "") || "draft";
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Vælg et billede." }, { status: 400 });
    }
    validateEventImage(file);
    const pathname = `events/${eventId}/${randomUUID()}-${safeEventImageName(file.name)}`;
    const blob = await put(pathname, file, { access: "public", addRandomSuffix: false });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Billedet kunne ikke uploades." }, { status: 400 });
  }
}
