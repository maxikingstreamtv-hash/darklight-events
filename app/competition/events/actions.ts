"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/admin/audit";
import { del } from "@vercel/blob";
import { readEventFeatures } from "@/lib/events/event-features";
import { clampEventImageFocus, isPermanentEventImageUrl, isVercelBlobUrl } from "@/lib/events/event-images";
import { syncApprovedParticipantsToCompetition } from "@/lib/events/result-sync";

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
  const imageFocusX = clampEventImageFocus(Number(formData.get("imageFocusX") ?? 50));
  const imageFocusY = clampEventImageFocus(Number(formData.get("imageFocusY") ?? 50));
  const disciplineId = String(formData.get("disciplineId") ?? "").trim();
  const features = readEventFeatures(formData);

  if (!title || !description || !startsAtValue) {
    throw new Error("Titel, beskrivelse og dato er påkrævet.");
  }
  if (!isPermanentEventImageUrl(imageUrl)) {
    throw new Error("Eventbilledet skal være uploadet permanent, før eventet gemmes.");
  }

  const startsAt = new Date(startsAtValue);
  if (Number.isNaN(startsAt.getTime())) {
    throw new Error("Datoen er ugyldig.");
  }

  const legacySlug = `${slugify(title) || "event"}-${Date.now()}`;
  if (disciplineId) {
    const discipline = await prisma.discipline.findFirst({ where: { id: disciplineId, active: true }, select: { id: true } });
    if (!discipline) throw new Error("Den valgte disciplin findes ikke eller er inaktiv.");
  }

  const event = await prisma.event.create({
    data: {
      title,
      slug: legacySlug,
      description,
      location: location || null,
      startsAt,
      status: status === "UPCOMING" || status === "ACTIVE" || status === "COMPLETED" || status === "CANCELLED" ? status : "DRAFT",
      public: publicValue,
      active,
      bannerUrl: imageUrl || null,
      imageAlt: imageAlt || null,
      thumbnailUrl: imageUrl || null,
      imageFocusX,
      imageFocusY,
      disciplineId: disciplineId || null,
      ...features,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      createdById: user.id,
    },
  });
  await syncApprovedParticipantsToCompetition(event.id);

  await writeAuditLog({
    actorId: user.id,
    action: "EVENT_CREATED",
    target: `Event:${event.id}`,
    details: { title: event.title, status: event.status },
  });

  revalidatePath("/competition/events");
  revalidatePath("/events");
  revalidatePath("/upcoming");
  revalidatePath("/");
  redirect(`/competition/events/${event.id}?tab=overview#oversigt`);
}

export async function updateCompetitionEventAction(id: string, formData: FormData) {
  const user = await requireCurrentUser();
  requireEventAccess(user.role);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const startsAtValue = String(formData.get("startsAt") ?? "").trim();
  const endsAtValue = String(formData.get("endsAt") ?? "").trim();
  const registrationOpenAtValue = String(formData.get("registrationOpenAt") ?? "").trim();
  const registrationCloseAtValue = String(formData.get("registrationCloseAt") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT");
  const publicValue = formData.get("public") === "on";
  const active = formData.get("active") === "on";
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageAlt = String(formData.get("imageAlt") ?? "").trim();
  const maxParticipants = Number(formData.get("maxParticipants") ?? "");
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const imageFocusX = clampEventImageFocus(Number(formData.get("imageFocusX") ?? 50));
  const imageFocusY = clampEventImageFocus(Number(formData.get("imageFocusY") ?? 50));
  const features = readEventFeatures(formData);
  const disciplineId = String(formData.get("disciplineId") ?? "").trim();

  if (!title || !description || !startsAtValue) {
    throw new Error("Titel, beskrivelse og dato er påkrævet.");
  }
  if (!isPermanentEventImageUrl(imageUrl)) {
    throw new Error("Eventbilledet skal være uploadet permanent, før eventet gemmes.");
  }

  const startsAt = new Date(startsAtValue);
  if (Number.isNaN(startsAt.getTime())) {
    throw new Error("Datoen er ugyldig.");
  }

  const previousEvent = await prisma.event.findUnique({ where: { id }, select: { bannerUrl: true, thumbnailUrl: true } });
  if (disciplineId) {
    const discipline = await prisma.discipline.findFirst({ where: { id: disciplineId, active: true }, select: { id: true } });
    if (!discipline) throw new Error("Den valgte disciplin findes ikke eller er inaktiv.");
  }
  const event = await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      location: location || null,
      startsAt,
      endsAt: endsAtValue ? new Date(endsAtValue) : null,
      registrationOpenAt: registrationOpenAtValue ? new Date(registrationOpenAtValue) : null,
      registrationCloseAt: registrationCloseAtValue ? new Date(registrationCloseAtValue) : null,
      maxParticipants: Number.isFinite(maxParticipants) && maxParticipants > 0 ? maxParticipants : null,
      status:
        status === "PUBLISHED" ||
        status === "REGISTRATION_OPEN" ||
        status === "REGISTRATION_CLOSED" ||
        status === "UPCOMING" ||
        status === "ACTIVE" ||
        status === "COMPLETED" ||
        status === "CANCELLED" ||
        status === "ARCHIVED"
          ? status
          : "DRAFT",
      public: publicValue,
      active,
      bannerUrl: imageUrl || null,
      thumbnailUrl: imageUrl || null,
      imageAlt: imageAlt || null,
      imageFocusX,
      imageFocusY,
      disciplineId: disciplineId || null,
      ...features,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });
  await syncApprovedParticipantsToCompetition(event.id);

  const oldBlobUrls = [previousEvent?.bannerUrl, previousEvent?.thumbnailUrl]
    .filter((url): url is string => Boolean(url && url !== imageUrl && isVercelBlobUrl(url)));
  if (oldBlobUrls.length > 0) {
    try {
      await del([...new Set(oldBlobUrls)]);
    } catch {
      // The database now points at the new permanent image. Blob cleanup can safely be retried later.
    }
  }

  await writeAuditLog({
    actorId: user.id,
    action: "EVENT_UPDATED",
    target: `Event:${event.id}`,
    details: { title: event.title, status: event.status },
  });

  revalidatePath("/competition/events");
  revalidatePath(`/competition/events/${event.id}`);
  revalidatePath("/events");
  revalidatePath("/upcoming");
  revalidatePath(`/events/${event.id}`);
  revalidatePath("/");
  redirect(`/competition/events/${event.id}?tab=details&saved=1#eventoplysninger`);
}

export async function updateCompetitionEventImageAction(id: string, formData: FormData) {
  const user = await requireCurrentUser();
  requireEventAccess(user.role);
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const imageFocusX = clampEventImageFocus(Number(formData.get("imageFocusX") ?? 50));
  const imageFocusY = clampEventImageFocus(Number(formData.get("imageFocusY") ?? 50));
  if (!isPermanentEventImageUrl(imageUrl)) throw new Error("Eventbilledet skal være en permanent URL.");
  const previous = await prisma.event.findUnique({ where: { id }, select: { bannerUrl: true, thumbnailUrl: true } });
  if (!previous) throw new Error("Eventet findes ikke.");
  await prisma.event.update({ where: { id }, data: { bannerUrl: imageUrl || null, thumbnailUrl: imageUrl || null, imageFocusX, imageFocusY } });
  const obsolete = [previous.bannerUrl, previous.thumbnailUrl].filter((url): url is string => Boolean(url && url !== imageUrl && isVercelBlobUrl(url)));
  if (obsolete.length) {
    try {
      await del([...new Set(obsolete)]);
    } catch (error) {
      console.error("Kunne ikke rydde gammelt eventbillede i Blob.", error instanceof Error ? error.message : "Ukendt fejl");
    }
  }
  await writeAuditLog({ actorId: user.id, action: imageUrl ? "EVENT_IMAGE_UPDATED" : "EVENT_IMAGE_REMOVED", target: `Event:${id}` });
  revalidatePath(`/competition/events/${id}`);
  revalidatePath(`/events/${id}`);
  revalidatePath("/events");
  revalidatePath("/upcoming");
  revalidatePath("/");
  redirect(`/competition/events/${id}?tab=media&saved=media#medier`);
}

export async function setEventRegistrationStatusAction(id: string, state: "open" | "closed") {
  const user = await requireCurrentUser();
  requireEventAccess(user.role);
  const event = await prisma.event.update({
    where: { id },
    data: state === "open"
      ? { status: "REGISTRATION_OPEN", registrationOpenAt: new Date() }
      : { status: "REGISTRATION_CLOSED", registrationCloseAt: new Date() },
    select: { id: true, title: true, status: true },
  });
  await writeAuditLog({
    actorId: user.id,
    action: state === "open" ? "EVENT_REGISTRATION_OPENED" : "EVENT_REGISTRATION_CLOSED",
    target: `Event:${event.id}`,
    details: { title: event.title, status: event.status },
  });
  revalidatePath("/competition/events");
  revalidatePath("/competition");
  revalidatePath(`/competition/events/${event.id}`);
  revalidatePath("/events");
  revalidatePath("/upcoming");
  revalidatePath(`/events/${event.id}`);
  revalidatePath("/");
  redirect(`/competition/events/${event.id}?tab=overview#oversigt`);
}

export async function archiveCompetitionEventAction(id: string) {
  const user = await requireCurrentUser();
  requireEventAccess(user.role);

  const event = await prisma.event.update({
    where: { id },
    data: { active: false, public: false, status: "ARCHIVED" },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "EVENT_ARCHIVED",
    target: `Event:${event.id}`,
    details: { title: event.title },
  });

  revalidatePath("/competition/events");
  revalidatePath("/competition");
  revalidatePath("/events");
  revalidatePath("/upcoming");
  revalidatePath("/");
  redirect("/competition/events");
}

export async function deleteCompetitionEventAction(id: string, formData: FormData) {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") {
    throw new Error("Kun Super Admin kan slette events permanent.");
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      competitions: { include: { results: true, participants: true } },
      hallOfFame: true,
    },
  });

  if (!event) throw new Error("Eventet findes ikke.");

  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== `SLET ${event.title}`) {
    throw new Error(`Skriv SLET ${event.title} for at bekræfte.`);
  }

  const hasHistoricData = event.hallOfFame.length > 0 || event.competitions.some((competition) => competition.results.length > 0);
  if (hasHistoricData) {
    throw new Error("Eventet har historiske resultater eller Hall of Fame-poster. Arkivér eventet i stedet.");
  }

  await prisma.event.delete({ where: { id } });
  await writeAuditLog({
    actorId: user.id,
    action: "EVENT_DELETED",
    target: `Event:${id}`,
    details: { title: event.title },
  });

  revalidatePath("/competition/events");
  revalidatePath("/events");
  revalidatePath("/upcoming");
  revalidatePath("/");
  redirect("/competition/events");
}
