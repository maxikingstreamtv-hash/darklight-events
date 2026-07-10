"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/admin/audit";

type ContentStatusValue = "ACTIVE" | "ARCHIVED";

export type ContentActionResult = {
  ok: boolean;
  message: string;
};

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readStatus(value: string): ContentStatusValue {
  return value === "ARCHIVED" ? "ARCHIVED" : "ACTIVE";
}

function isActiveStatus(status: ContentStatusValue) {
  return status === "ACTIVE";
}

function readSortOrder(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function requireContentEditor() {
  const user = await requireCurrentUser();

  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    redirect("/forbidden");
  }

  return user;
}

export async function updateFaqItemAction(id: string, formData: FormData): Promise<ContentActionResult> {
  const actor = await requireContentEditor();
  const question = text(formData, "question");
  const answer = text(formData, "answer");
  const status = readStatus(text(formData, "status"));

  if (!id) {
    return { ok: false, message: "FAQ-id mangler. Opdateringen blev ikke gemt." };
  }

  if (!question || !answer) {
    return { ok: false, message: "FAQ skal have både spørgsmål og svar." };
  }

  const existing = await prisma.faqItem.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return { ok: false, message: "FAQ-punktet blev ikke fundet i databasen." };
  }

  try {
    const updated = await prisma.faqItem.update({
      where: { id },
      data: {
        question,
        category: text(formData, "category") || "Generelt",
        note: text(formData, "note") || null,
        answer,
        active: isActiveStatus(status),
        status,
        sortOrder: readSortOrder(text(formData, "sortOrder")),
      },
      select: { id: true, question: true, category: true, active: true, status: true, sortOrder: true },
    });

    await writeAuditLog({
      actorId: actor.id,
      action: "faq_item_updated",
      target: `faq:${updated.id}`,
      details: {
        question: updated.question,
        category: updated.category,
        active: updated.active,
        status: updated.status,
        sortOrder: updated.sortOrder,
      },
    });

    revalidatePath("/faq");
    revalidatePath("/competition/admin");
    return { ok: true, message: "FAQ gemt." };
  } catch (error) {
    console.error("FAQ update failed", error);
    return { ok: false, message: "FAQ kunne ikke gemmes i databasen." };
  }
}

export async function archiveFaqItemAction(id: string): Promise<ContentActionResult> {
  const actor = await requireContentEditor();

  if (!id) {
    return { ok: false, message: "FAQ-id mangler. Ændringen blev ikke gemt." };
  }

  const existing = await prisma.faqItem.findUnique({
    where: { id },
    select: { id: true, active: true, status: true },
  });

  if (!existing) {
    return { ok: false, message: "FAQ-punktet blev ikke fundet i databasen." };
  }

  const nextActive = !existing.active || existing.status === "ARCHIVED";
  const nextStatus: ContentStatusValue = nextActive ? "ACTIVE" : "ARCHIVED";

  try {
    const updated = await prisma.faqItem.update({
      where: { id },
      data: { status: nextStatus, active: nextActive },
      select: { id: true, question: true, active: true, status: true },
    });

    await writeAuditLog({
      actorId: actor.id,
      action: updated.active ? "faq_item_activated" : "faq_item_archived",
      target: `faq:${updated.id}`,
      details: { question: updated.question, active: updated.active, status: updated.status },
    });

    revalidatePath("/faq");
    revalidatePath("/competition/admin");
    return { ok: true, message: updated.active ? "FAQ aktiveret." : "FAQ arkiveret." };
  } catch (error) {
    console.error("FAQ archive toggle failed", error);
    return { ok: false, message: "FAQ-status kunne ikke gemmes i databasen." };
  }
}

export async function updateRuleSetAction(id: string, formData: FormData): Promise<ContentActionResult> {
  const actor = await requireContentEditor();
  const title = text(formData, "title");
  const summary = text(formData, "summary");
  const content = text(formData, "content");
  const status = readStatus(text(formData, "status"));

  if (!id) {
    return { ok: false, message: "Regelsæt-id mangler. Opdateringen blev ikke gemt." };
  }

  if (!title || !summary || !content) {
    return { ok: false, message: "Regelsæt skal have titel, kort beskrivelse og indhold." };
  }

  const existing = await prisma.ruleSet.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return { ok: false, message: "Regelsættet blev ikke fundet i databasen." };
  }

  try {
    const updated = await prisma.ruleSet.update({
      where: { id },
      data: {
        title,
        category: text(formData, "category") || "Generelt",
        description: summary,
        summary,
        content,
        rules: content.split(/\r?\n/).map((line: string) => line.trim()).filter(Boolean),
        active: isActiveStatus(status),
        status,
        sortOrder: readSortOrder(text(formData, "sortOrder")),
      },
      select: { id: true, title: true, category: true, active: true, status: true, sortOrder: true },
    });

    await writeAuditLog({
      actorId: actor.id,
      action: "ruleset_updated",
      target: `ruleset:${updated.id}`,
      details: {
        title: updated.title,
        category: updated.category,
        active: updated.active,
        status: updated.status,
        sortOrder: updated.sortOrder,
      },
    });

    revalidatePath("/regelsaet");
    revalidatePath("/competition/admin");
    return { ok: true, message: "Regelsæt gemt." };
  } catch (error) {
    console.error("Ruleset update failed", error);
    return { ok: false, message: "Regelsæt kunne ikke gemmes i databasen." };
  }
}

export async function archiveRuleSetAction(id: string): Promise<ContentActionResult> {
  const actor = await requireContentEditor();

  if (!id) {
    return { ok: false, message: "Regelsæt-id mangler. Ændringen blev ikke gemt." };
  }

  const existing = await prisma.ruleSet.findUnique({
    where: { id },
    select: { id: true, active: true, status: true },
  });

  if (!existing) {
    return { ok: false, message: "Regelsættet blev ikke fundet i databasen." };
  }

  const nextActive = !existing.active || existing.status === "ARCHIVED";
  const nextStatus: ContentStatusValue = nextActive ? "ACTIVE" : "ARCHIVED";

  try {
    const updated = await prisma.ruleSet.update({
      where: { id },
      data: { status: nextStatus, active: nextActive },
      select: { id: true, title: true, active: true, status: true },
    });

    await writeAuditLog({
      actorId: actor.id,
      action: updated.active ? "ruleset_activated" : "ruleset_archived",
      target: `ruleset:${updated.id}`,
      details: { title: updated.title, active: updated.active, status: updated.status },
    });

    revalidatePath("/regelsaet");
    revalidatePath("/competition/admin");
    return { ok: true, message: updated.active ? "Regelsæt aktiveret." : "Regelsæt arkiveret." };
  } catch (error) {
    console.error("Ruleset archive toggle failed", error);
    return { ok: false, message: "Regelsæt-status kunne ikke gemmes i databasen." };
  }
}
