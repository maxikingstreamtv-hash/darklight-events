"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { normalizeTeamSkills, teamSectionSlug } from "@/lib/team/team-members";
import { deleteNewBlobAfterFailedSave, deleteReplacedBlobImage } from "@/lib/images/blob-cleanup";
import { isPermanentImageUrl } from "@/lib/images/image-upload";

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const done = (kind: "ok" | "error", message: string): never => redirect(`/team?${kind}=${encodeURIComponent(message)}#team-admin`);

async function requireSuperAdmin() {
  const actor = await requireCurrentUser();
  if (actor.role !== "SUPER_ADMIN") redirect("/forbidden");
  return actor;
}

export async function saveTeamMemberAction(data: FormData) {
  await requireSuperAdmin();
  const id = text(data, "id");
  const name = text(data, "name");
  const roleTitle = text(data, "roleTitle");
  if (name.length < 2 || roleTitle.length < 2) done("error", "Navn og rolle skal udfyldes.");
  const imageInput = text(data, "imageUrl");
  if (imageInput && !isPermanentImageUrl(imageInput)) done("error", "Billedet skal være en permanent URL.");
  const imageUrl = imageInput || null;
  const sectionId = text(data, "sectionId") || null;
  if (sectionId) {
    const sectionExists = await prisma.teamSection.count({ where: { id: sectionId } });
    if (!sectionExists) done("error", "Den valgte teamsektion findes ikke.");
  }
  const previous = id ? await prisma.teamMember.findUnique({ where: { id }, select: { imageUrl: true } }) : null;
  try {
    const payload = {
      name,
      roleTitle,
      secondaryTitle: text(data, "secondaryTitle") || null,
      quote: text(data, "quote") || null,
      bio: text(data, "bio") || null,
      imageUrl,
      skills: normalizeTeamSkills(text(data, "skills")),
      active: data.get("active") === "on",
      sortOrder: Number.parseInt(text(data, "sortOrder"), 10) || 0,
      sectionId,
    };
    if (id) await prisma.teamMember.update({ where: { id }, data: payload });
    else await prisma.teamMember.create({ data: payload });
  } catch {
    await deleteNewBlobAfterFailedSave(imageUrl, previous?.imageUrl);
    done("error", "Teammedlemmet kunne ikke gemmes.");
  }
  await deleteReplacedBlobImage(previous?.imageUrl, imageUrl);
  revalidatePath("/team");
  done("ok", id ? "Teammedlem gemt." : "Teammedlem oprettet.");
}

async function uniqueSectionSlug(name: string, currentId?: string) {
  const base = teamSectionSlug(name);
  let slug = base;
  let suffix = 2;
  while (await prisma.teamSection.findFirst({ where: { slug, ...(currentId ? { id: { not: currentId } } : {}) }, select: { id: true } })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

export async function saveTeamSectionAction(data: FormData) {
  await requireSuperAdmin();
  const id = text(data, "id");
  const name = text(data, "name");
  if (!name) done("error", "Sektionens navn skal udfyldes.");
  const sortOrderRaw = text(data, "sortOrder") || "0";
  if (!/^-?\d+$/.test(sortOrderRaw)) done("error", "Sorteringsnummer skal være et heltal.");
  const payload = {
    name,
    slug: await uniqueSectionSlug(name, id || undefined),
    description: text(data, "description") || null,
    sortOrder: Number.parseInt(sortOrderRaw, 10),
    isPublic: data.get("isPublic") === "on",
  };
  try {
    if (id) await prisma.teamSection.update({ where: { id }, data: payload });
    else await prisma.teamSection.create({ data: payload });
  } catch {
    done("error", "Teamsektionen kunne ikke gemmes.");
  }
  revalidatePath("/team");
  done("ok", id ? "Teamsektion gemt." : "Teamsektion oprettet.");
}

export async function deleteTeamSectionAction(id: string, data: FormData) {
  await requireSuperAdmin();
  if (data.get("confirmDelete") !== "on") done("error", "Bekræft sletning af teamsektionen.");
  const section = await prisma.teamSection.findUnique({ where: { id }, select: { name: true } });
  if (!section) return done("error", "Teamsektionen findes ikke.");
  await prisma.teamSection.delete({ where: { id } });
  revalidatePath("/team");
  done("ok", `Sektionen ${section.name} blev slettet. Medlemmerne er bevaret uden sektion.`);
}

export async function deleteTeamMemberAction(id: string) {
  await requireSuperAdmin();
  const member = await prisma.teamMember.findUnique({ where: { id }, select: { imageUrl: true } });
  if (!member) return done("error", "Teammedlemmet findes ikke.");
  await prisma.teamMember.delete({ where: { id } });
  await deleteReplacedBlobImage(member.imageUrl, null);
  revalidatePath("/team");
  done("ok", "Teammedlem slettet.");
}
