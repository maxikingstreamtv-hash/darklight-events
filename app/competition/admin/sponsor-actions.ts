"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/admin/audit";

type SponsorLevelValue = "PLATINUM" | "GOLD" | "SILVER" | "PARTNER";
type SponsorStatusValue = "ACTIVE" | "PENDING" | "ARCHIVED";
type SponsorTypeValue = "MAIN_SPONSOR" | "SPONSOR" | "PARTNER";

const sponsorLevels: SponsorLevelValue[] = ["PLATINUM", "GOLD", "SILVER", "PARTNER"];
const sponsorStatuses: SponsorStatusValue[] = ["ACTIVE", "PENDING", "ARCHIVED"];
const sponsorTypes: SponsorTypeValue[] = ["MAIN_SPONSOR", "SPONSOR", "PARTNER"];

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function safeUrl(value: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `sponsor-${Date.now()}`;
}

function readEnum<T extends string>(value: string, allowed: T[], fallback: T) {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function redirectAdmin(key: "contentOk" | "contentError", message: string): never {
  redirect(`/competition/admin?${key}=${encodeURIComponent(message)}#sponsor-manager`);
}

function revalidateSponsorRoutes(slug?: string) {
  revalidatePath("/");
  revalidatePath("/competition/admin");
  revalidatePath("/sponsorer");
  if (slug) revalidatePath(`/sponsorer/${slug}`);
}

async function requireSponsorAdmin() {
  const actor = await requireCurrentUser();

  if (actor.role !== "SUPER_ADMIN" && actor.role !== "ADMIN") {
    redirect("/forbidden");
  }

  return actor;
}

async function requireSponsorSuperAdmin() {
  const actor = await requireCurrentUser();

  if (actor.role !== "SUPER_ADMIN") {
    redirect("/forbidden");
  }

  return actor;
}

export async function saveSponsorAction(formData: FormData) {
  const actor = await requireSponsorAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");

  if (name.length < 2) {
    redirectAdmin("contentError", "Sponsor skal have et navn.");
  }

  const sponsorType = readEnum(text(formData, "sponsorType"), sponsorTypes, "SPONSOR");
  const isMainSponsor = formData.get("isMainSponsor") === "on" || sponsorType === "MAIN_SPONSOR";
  const status = readEnum(text(formData, "status"), sponsorStatuses, "ACTIVE");
  const slug = slugify(text(formData, "slug") || name);
  const logoUrlInput = text(formData, "logoUrl");
  const websiteUrlInput = text(formData, "websiteUrl");
  const logoUrl = safeUrl(logoUrlInput);
  const websiteUrl = safeUrl(websiteUrlInput);

  if (logoUrlInput && !logoUrl) {
    redirectAdmin("contentError", "Logo-URL skal starte med http:// eller https://.");
  }

  if (websiteUrlInput && !websiteUrl) {
    redirectAdmin("contentError", "Website-URL skal starte med http:// eller https://.");
  }

  const payload = {
    slug,
    name,
    level: readEnum(text(formData, "level"), sponsorLevels, "SILVER"),
    sponsorType: isMainSponsor ? "MAIN_SPONSOR" as const : sponsorType,
    isMainSponsor,
    contactPerson: text(formData, "contactPerson") || null,
    eventsSupported: text(formData, "eventsSupported").split(",").map((item) => item.trim()).filter(Boolean),
    description: text(formData, "description") || "Ingen beskrivelse endnu.",
    logoInitials: text(formData, "logoInitials") || name.slice(0, 3).toUpperCase(),
    logoUrl,
    websiteUrl,
    ctaLabel: text(formData, "ctaLabel") || null,
    sortOrder: Number(text(formData, "sortOrder")) || 0,
    active: status === "ACTIVE",
    status,
  };

  const sponsor = await prisma.$transaction(async (tx) => {
    if (isMainSponsor && status === "ACTIVE") {
      await tx.sponsor.updateMany({
        where: { id: id ? { not: id } : undefined, isMainSponsor: true, status: "ACTIVE" },
        data: { isMainSponsor: false, sponsorType: "SPONSOR" },
      });
    }

    if (id) {
      return tx.sponsor.update({ where: { id }, data: payload, select: { id: true, slug: true, name: true } });
    }

    return tx.sponsor.create({ data: payload, select: { id: true, slug: true, name: true } });
  });

  await writeAuditLog({
    actorId: actor.id,
    action: id ? "sponsor_updated" : "sponsor_created",
    target: `sponsor:${sponsor.id}`,
    details: { name: sponsor.name, isMainSponsor },
  });

  revalidateSponsorRoutes(sponsor.slug);
  redirectAdmin("contentOk", id ? "Sponsor gemt." : "Sponsor oprettet.");
}

export async function archiveSponsorAction(id: string) {
  const actor = await requireSponsorAdmin();
  const sponsor = await prisma.sponsor.findUnique({ where: { id }, select: { id: true, slug: true, name: true, active: true, status: true } });

  if (!sponsor) {
    redirectAdmin("contentError", "Sponsor blev ikke fundet.");
  }

  const nextActive = !(sponsor.active && sponsor.status === "ACTIVE");
  const updated = await prisma.sponsor.update({
    where: { id },
    data: { active: nextActive, status: nextActive ? "ACTIVE" : "ARCHIVED", isMainSponsor: nextActive ? undefined : false, sponsorType: nextActive ? undefined : "SPONSOR" },
    select: { id: true, slug: true, name: true, active: true },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: updated.active ? "sponsor_activated" : "sponsor_archived",
    target: `sponsor:${updated.id}`,
    details: { name: updated.name },
  });

  revalidateSponsorRoutes(updated.slug);
  redirectAdmin("contentOk", updated.active ? "Sponsor aktiveret." : "Sponsor arkiveret.");
}

export async function deleteSponsorAction(id: string, formData: FormData) {
  const actor = await requireSponsorSuperAdmin();
  const sponsor = await prisma.sponsor.findUnique({ where: { id }, select: { id: true, slug: true, name: true } });

  if (!sponsor) {
    redirectAdmin("contentError", "Sponsor blev ikke fundet.");
  }

  const phrase = `SLET ${sponsor.name}`.toUpperCase();
  if (text(formData, "confirmation").toUpperCase() !== phrase) {
    redirectAdmin("contentError", `Skriv "${phrase}" for at bekræfte.`);
  }

  await prisma.sponsor.delete({ where: { id } });
  await writeAuditLog({
    actorId: actor.id,
    action: "sponsor_deleted",
    target: `sponsor:${sponsor.id}`,
    details: { name: sponsor.name },
  });

  revalidateSponsorRoutes(sponsor.slug);
  redirectAdmin("contentOk", "Sponsor slettet permanent.");
}
