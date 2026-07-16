"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function requireEventAccess(role: string) {
  if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "EVENT_MANAGER") {
    throw new Error("Ingen adgang til eventstyring.");
  }
}

export async function createCompetitionEventAction(formData: FormData) {
  const user = await requireCurrentUser();
  requireEventAccess(user.role);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const startsAtValue = String(formData.get("startsAt") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT");
  const publicValue = formData.get("public") === "on";
  const active = formData.get("active") === "on";
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageAlt = String(formData.get("imageAlt") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!title || !description || !startsAtValue) {
    throw new Error("Titel, beskrivelse og dato er påkrævet.");
  }

  const startsAt = new Date(startsAtValue);
  if (Number.isNaN(startsAt.getTime())) {
    throw new Error("Datoen er ugyldig.");
  }

  const baseSlug = slugify(String(formData.get("slug") ?? title));
  const slug = baseSlug || slugify(title);

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      description,
      location: location || null,
      startsAt,
      status: status === "UPCOMING" || status === "ACTIVE" || status === "COMPLETED" || status === "CANCELLED" ? status : "DRAFT",
      public: publicValue,
      active,
      bannerUrl: imageUrl || null,
      imageAlt: imageAlt || null,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      createdById: user.id,
    },
  });

  revalidatePath("/competition/events");
  revalidatePath("/events");
  revalidatePath("/");
  redirect(`/competition/events/${event.id}`);
}
