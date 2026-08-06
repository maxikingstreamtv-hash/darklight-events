"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/admin/audit";
import { requireCurrentUser } from "@/lib/auth/session";
import { readEventFeatures } from "@/lib/events/event-features";
import { prisma } from "@/lib/prisma";
import { assertValidResultConfiguration, readResultMethod } from "@/lib/events/result-methods";

function assertDisciplineAdmin(role: string) {
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") throw new Error("Kun Super Admin og Admin kan administrere discipliner.");
}

function slugify(value: string) {
  return value.toLowerCase().trim()
    .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function readDiscipline(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const abbreviation = String(formData.get("abbreviation") ?? "").trim().toUpperCase().slice(0, 6);
  const category = String(formData.get("category") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const features = readEventFeatures(formData);
  const resultMethod = readResultMethod(formData);
  assertValidResultConfiguration(resultMethod, features);
  if (!name || !description || !abbreviation) throw new Error("Navn, beskrivelse og forkortelse er påkrævet.");
  if (!features.usesVehicles) features.requiresVehicleApproval = false;
  return {
    name,
    description,
    abbreviation,
    category: category || null,
    active: formData.get("active") === "on",
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    ...features,
    resultMethod,
  };
}

function revalidateDisciplines() {
  revalidatePath("/competition");
  revalidatePath("/competition/disciplines");
  revalidatePath("/competition/events/create");
}

export async function createDisciplineAction(formData: FormData) {
  const user = await requireCurrentUser();
  assertDisciplineAdmin(user.role);
  const values = readDiscipline(formData);
  const baseSlug = slugify(values.name) || "disciplin";
  const existing = await prisma.discipline.findUnique({ where: { slug: baseSlug }, select: { id: true } });
  const discipline = await prisma.discipline.create({ data: { ...values, slug: existing ? `${baseSlug}-${Date.now()}` : baseSlug } });
  await writeAuditLog({ actorId: user.id, action: "DISCIPLINE_CREATED", target: `Discipline:${discipline.id}`, details: { name: discipline.name } });
  revalidateDisciplines();
  redirect("/competition/disciplines?saved=created");
}

export async function updateDisciplineAction(id: string, formData: FormData) {
  const user = await requireCurrentUser();
  assertDisciplineAdmin(user.role);
  const discipline = await prisma.discipline.update({ where: { id }, data: readDiscipline(formData) });
  await writeAuditLog({ actorId: user.id, action: "DISCIPLINE_UPDATED", target: `Discipline:${discipline.id}`, details: { name: discipline.name } });
  revalidateDisciplines();
  redirect("/competition/disciplines?saved=updated");
}

export async function deleteDisciplineAction(id: string) {
  const user = await requireCurrentUser();
  assertDisciplineAdmin(user.role);
  const discipline = await prisma.discipline.findUnique({ where: { id }, include: { _count: { select: { events: true } } } });
  if (!discipline) throw new Error("Disciplinen findes ikke.");
  if (discipline._count.events > 0) throw new Error("Disciplinen kan ikke slettes, mens events bruger den. Deaktivér den i stedet.");
  await prisma.discipline.delete({ where: { id } });
  await writeAuditLog({ actorId: user.id, action: "DISCIPLINE_DELETED", target: `Discipline:${id}`, details: { name: discipline.name } });
  revalidateDisciplines();
  redirect("/competition/disciplines?saved=deleted");
}
