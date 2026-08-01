"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { normalizeTeamSkills } from "@/lib/team/team-members";
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

export async function deleteTeamMemberAction(id: string) {
  await requireSuperAdmin();
  const member = await prisma.teamMember.findUnique({ where: { id }, select: { imageUrl: true } });
  if (!member) return done("error", "Teammedlemmet findes ikke.");
  await prisma.teamMember.delete({ where: { id } });
  await deleteReplacedBlobImage(member.imageUrl, null);
  revalidatePath("/team");
  done("ok", "Teammedlem slettet.");
}
