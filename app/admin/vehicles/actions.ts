"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireVehicleManager } from "@/lib/admin/vehicle-access";
import { writeAuditLog } from "@/lib/admin/audit";

type VehicleStatusValue = "ACTIVE" | "INACTIVE" | "SUSPENDED";
type InspectionStatusValue = "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED";
type ChecklistCategoryValue = "PERFORMANCE" | "ENGINE" | "SAFETY" | "DOCUMENTS" | "REQUIRED_EQUIPMENT" | "EXTERIOR" | "OTHER";
type ChecklistResultValue = "NOT_CHECKED" | "APPROVED" | "REJECTED" | "NOT_APPLICABLE";

const vehicleStatuses: VehicleStatusValue[] = ["ACTIVE", "INACTIVE", "SUSPENDED"];
const inspectionStatuses: InspectionStatusValue[] = ["PENDING", "IN_PROGRESS", "APPROVED", "REJECTED"];
const checklistCategories: ChecklistCategoryValue[] = ["PERFORMANCE", "ENGINE", "SAFETY", "DOCUMENTS", "REQUIRED_EQUIPMENT", "EXTERIOR", "OTHER"];
const checklistResults: ChecklistResultValue[] = ["NOT_CHECKED", "APPROVED", "REJECTED", "NOT_APPLICABLE"];

const oldDefaultTemplateLabels = ["Motor og ydelse", "Sikkerhed", "Dokumenter", "Obligatorisk udstyr", "Karrosseri"];

const performanceTemplateItems = [
  { category: "PERFORMANCE" as const, label: "Motor Tier", description: "Kontroller motorens tier.", required: true, sortOrder: 10 },
  { category: "PERFORMANCE" as const, label: "Bil Class", description: "Kontroller hvilken klasse køretøjet tilhører.", required: true, sortOrder: 20 },
  { category: "PERFORMANCE" as const, label: "Nitro", description: "Kontroller om nitro er monteret og om niveauet overholder reglerne.", required: true, sortOrder: 30 },
  { category: "PERFORMANCE" as const, label: "Bremser", description: "Kontroller bremseopgraderingen.", required: true, sortOrder: 40 },
  { category: "PERFORMANCE" as const, label: "Armor", description: "Kontroller armor-opgraderingen.", required: true, sortOrder: 50 },
];

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

function redirectWithMessage(path: string, key: "ok" | "error", message: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);
}

function readVehicleStatus(value: string): VehicleStatusValue {
  return vehicleStatuses.includes(value as VehicleStatusValue) ? (value as VehicleStatusValue) : "ACTIVE";
}

function readInspectionStatus(value: string): InspectionStatusValue {
  return inspectionStatuses.includes(value as InspectionStatusValue) ? (value as InspectionStatusValue) : "PENDING";
}

function readChecklistCategory(value: string): ChecklistCategoryValue {
  return checklistCategories.includes(value as ChecklistCategoryValue) ? (value as ChecklistCategoryValue) : "OTHER";
}

function readChecklistResult(value: string): ChecklistResultValue {
  return checklistResults.includes(value as ChecklistResultValue) ? (value as ChecklistResultValue) : "NOT_CHECKED";
}

async function ensureVehicle(vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, displayName: true },
  });

  if (!vehicle) {
    redirectWithMessage("/admin/vehicles", "error", "Køretøjet blev ikke fundet.");
  }

  return vehicle;
}

export async function createVehicleAction(formData: FormData) {
  const actor = await requireVehicleManager();
  const ownerId = text(formData, "ownerId");
  const displayName = text(formData, "displayName");

  if (!ownerId || !displayName) {
    redirectWithMessage("/admin/vehicles/create", "error", "Ejer og køretøjsnavn er påkrævet.");
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      ownerId,
      displayName,
      modelName: optionalText(formData, "modelName"),
      spawnCode: optionalText(formData, "spawnCode"),
      licensePlate: optionalText(formData, "licensePlate"),
      vehicleClass: optionalText(formData, "vehicleClass"),
      description: optionalText(formData, "description"),
      imageUrl: optionalText(formData, "imageUrl"),
      status: readVehicleStatus(text(formData, "status")),
      createdById: actor.id,
    },
    select: { id: true, displayName: true, ownerId: true },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "vehicle_assigned",
    target: `vehicle:${vehicle.id}`,
    details: { displayName: vehicle.displayName, ownerId: vehicle.ownerId },
  });

  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/users/${ownerId}`);
  redirect(`/admin/vehicles/${vehicle.id}?ok=${encodeURIComponent("Køretøjet blev oprettet og tildelt.")}`);
}

export async function updateVehicleAction(vehicleId: string, formData: FormData) {
  const actor = await requireVehicleManager();
  const vehicle = await ensureVehicle(vehicleId);
  const displayName = text(formData, "displayName");

  if (!displayName) {
    redirectWithMessage(`/admin/vehicles/${vehicleId}`, "error", "Køretøjsnavn er påkrævet.");
  }

  const updated = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      displayName,
      modelName: optionalText(formData, "modelName"),
      spawnCode: optionalText(formData, "spawnCode"),
      licensePlate: optionalText(formData, "licensePlate"),
      vehicleClass: optionalText(formData, "vehicleClass"),
      description: optionalText(formData, "description"),
      imageUrl: optionalText(formData, "imageUrl"),
      status: readVehicleStatus(text(formData, "status")),
    },
    select: { id: true, displayName: true },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "vehicle_edited",
    target: `vehicle:${vehicle.id}`,
    details: { from: vehicle.displayName, to: updated.displayName },
  });

  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${vehicleId}`);
  redirectWithMessage(`/admin/vehicles/${vehicleId}`, "ok", "Køretøjet blev gemt.");
}

export async function deactivateVehicleAction(vehicleId: string) {
  const actor = await requireVehicleManager();
  const vehicle = await ensureVehicle(vehicleId);

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status: "INACTIVE" },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "vehicle_deactivated",
    target: `vehicle:${vehicle.id}`,
    details: { displayName: vehicle.displayName },
  });

  revalidatePath("/admin/vehicles");
  revalidatePath(`/admin/vehicles/${vehicleId}`);
  redirectWithMessage(`/admin/vehicles/${vehicleId}`, "ok", "Køretøjet blev deaktiveret.");
}

export async function createInspectionAction(vehicleId: string, formData: FormData) {
  const actor = await requireVehicleManager();
  await ensureVehicle(vehicleId);

  const title = text(formData, "title");
  const templateId = text(formData, "templateId");

  if (!title) {
    redirectWithMessage(`/admin/vehicles/${vehicleId}`, "error", "Inspektionstitel er påkrævet.");
  }

  const template = templateId
    ? await prisma.vehicleChecklistTemplate.findUnique({
        where: { id: templateId },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      })
    : null;

  const inspection = await prisma.vehicleInspection.create({
    data: {
      vehicleId,
      title,
      notes: optionalText(formData, "notes"),
      status: "PENDING",
      items: template
        ? {
            create: template.items.map((item: { category: ChecklistCategoryValue; label: string; description: string | null; required: boolean; sortOrder: number }) => ({
              category: item.category,
              label: item.label,
              description: item.description,
              required: item.required,
              sortOrder: item.sortOrder,
            })),
          }
        : undefined,
    },
    select: { id: true, title: true },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "inspection_created",
    target: `vehicle:${vehicleId}`,
    details: { inspectionId: inspection.id, title: inspection.title },
  });

  revalidatePath(`/admin/vehicles/${vehicleId}`);
  redirectWithMessage(`/admin/vehicles/${vehicleId}`, "ok", "Inspektionen blev oprettet.");
}

export async function addChecklistItemAction(vehicleId: string, inspectionId: string, formData: FormData) {
  const actor = await requireVehicleManager();
  const label = text(formData, "label");

  if (!label) {
    redirectWithMessage(`/admin/vehicles/${vehicleId}`, "error", "Checklist-punkt skal have en label.");
  }

  await prisma.vehicleChecklistItem.create({
    data: {
      inspectionId,
      category: readChecklistCategory(text(formData, "category")),
      label,
      description: optionalText(formData, "description"),
      result: readChecklistResult(text(formData, "result")),
      required: formData.get("required") === "on",
      sortOrder: Number(text(formData, "sortOrder")) || 0,
      adminNote: optionalText(formData, "adminNote"),
    },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "checklist_changed",
    target: `inspection:${inspectionId}`,
    details: { change: "item_added", label },
  });

  revalidatePath(`/admin/vehicles/${vehicleId}`);
  redirectWithMessage(`/admin/vehicles/${vehicleId}`, "ok", "Checklist-punkt blev tilføjet.");
}

export async function updateChecklistItemAction(vehicleId: string, itemId: string, formData: FormData) {
  const actor = await requireVehicleManager();
  const label = text(formData, "label");

  if (!label) {
    redirectWithMessage(`/admin/vehicles/${vehicleId}`, "error", "Checklist-punkt skal have en label.");
  }

  const item = await prisma.vehicleChecklistItem.update({
    where: { id: itemId },
    data: {
      category: readChecklistCategory(text(formData, "category")),
      label,
      description: optionalText(formData, "description"),
      result: readChecklistResult(text(formData, "result")),
      required: formData.get("required") === "on",
      sortOrder: Number(text(formData, "sortOrder")) || 0,
      adminNote: optionalText(formData, "adminNote"),
    },
    select: { inspectionId: true, label: true },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "checklist_changed",
    target: `inspection:${item.inspectionId}`,
    details: { change: "item_updated", label: item.label },
  });

  revalidatePath(`/admin/vehicles/${vehicleId}`);
  redirectWithMessage(`/admin/vehicles/${vehicleId}`, "ok", "Checklist-punkt blev gemt.");
}

export async function removeChecklistItemAction(vehicleId: string, itemId: string) {
  const actor = await requireVehicleManager();
  const item = await prisma.vehicleChecklistItem.delete({
    where: { id: itemId },
    select: { inspectionId: true, label: true },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "checklist_changed",
    target: `inspection:${item.inspectionId}`,
    details: { change: "item_removed", label: item.label },
  });

  revalidatePath(`/admin/vehicles/${vehicleId}`);
  redirectWithMessage(`/admin/vehicles/${vehicleId}`, "ok", "Checklist-punkt blev fjernet.");
}

export async function updateInspectionStatusAction(vehicleId: string, inspectionId: string, formData: FormData) {
  const actor = await requireVehicleManager();
  const status = readInspectionStatus(text(formData, "status"));

  await prisma.vehicleInspection.update({
    where: { id: inspectionId },
    data: {
      status,
      inspectedById: status === "APPROVED" || status === "REJECTED" ? actor.id : null,
      inspectedAt: status === "APPROVED" || status === "REJECTED" ? new Date() : null,
      notes: optionalText(formData, "notes"),
    },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: status === "APPROVED" ? "inspection_approved" : status === "REJECTED" ? "inspection_rejected" : "inspection_status_changed",
    target: `inspection:${inspectionId}`,
    details: { status },
  });

  revalidatePath(`/admin/vehicles/${vehicleId}`);
  redirectWithMessage(`/admin/vehicles/${vehicleId}`, "ok", "Inspektionen blev opdateret.");
}

export async function createChecklistTemplateAction(formData: FormData) {
  const actor = await requireVehicleManager();
  const name = text(formData, "templateName");

  if (!name) {
    redirectWithMessage("/admin/vehicles", "error", "Template-navn er påkrævet.");
  }

  const template = await prisma.vehicleChecklistTemplate.upsert({
    where: { name },
    update: { description: optionalText(formData, "templateDescription") },
    create: {
      name,
      description: optionalText(formData, "templateDescription"),
    },
    select: { id: true, name: true },
  });

  await prisma.vehicleChecklistTemplateItem.deleteMany({
    where: {
      templateId: template.id,
      label: { in: oldDefaultTemplateLabels },
    },
  });

  await Promise.all(
    performanceTemplateItems.map(async (defaultItem: (typeof performanceTemplateItems)[number]) => {
      const existing = await prisma.vehicleChecklistTemplateItem.findFirst({
        where: {
          templateId: template.id,
          label: defaultItem.label,
        },
        select: { id: true },
      });

      if (existing) {
        return prisma.vehicleChecklistTemplateItem.update({
          where: { id: existing.id },
          data: defaultItem,
        });
      }

      return prisma.vehicleChecklistTemplateItem.create({
        data: {
          templateId: template.id,
          ...defaultItem,
        },
      });
    }),
  );

  await writeAuditLog({
    actorId: actor.id,
    action: "checklist_template_saved",
    target: `vehicle-template:${template.id}`,
    details: { name: template.name },
  });

  revalidatePath("/admin/vehicles");
  redirectWithMessage("/admin/vehicles", "ok", "Checklist-template blev gemt.");
}

export async function addChecklistTemplateItemAction(templateId: string, formData: FormData) {
  const actor = await requireVehicleManager();
  const label = text(formData, "label");

  if (!label) {
    redirectWithMessage("/admin/vehicles", "error", "Template-punkt skal have en label.");
  }

  const item = await prisma.vehicleChecklistTemplateItem.create({
    data: {
      templateId,
      category: readChecklistCategory(text(formData, "category")),
      label,
      description: optionalText(formData, "description"),
      required: formData.get("required") === "on",
      sortOrder: Number(text(formData, "sortOrder")) || 0,
    },
    select: { id: true, label: true },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "checklist_template_item_added",
    target: `vehicle-template:${templateId}`,
    details: { itemId: item.id, label: item.label },
  });

  revalidatePath("/admin/vehicles");
  redirectWithMessage("/admin/vehicles", "ok", "Template-punkt blev tilføjet.");
}

export async function updateChecklistTemplateItemAction(templateId: string, itemId: string, formData: FormData) {
  const actor = await requireVehicleManager();
  const label = text(formData, "label");

  if (!label) {
    redirectWithMessage("/admin/vehicles", "error", "Template-punkt skal have en label.");
  }

  const item = await prisma.vehicleChecklistTemplateItem.update({
    where: { id: itemId },
    data: {
      category: readChecklistCategory(text(formData, "category")),
      label,
      description: optionalText(formData, "description"),
      required: formData.get("required") === "on",
      sortOrder: Number(text(formData, "sortOrder")) || 0,
    },
    select: { id: true, label: true },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "checklist_template_item_updated",
    target: `vehicle-template:${templateId}`,
    details: { itemId: item.id, label: item.label },
  });

  revalidatePath("/admin/vehicles");
  redirectWithMessage("/admin/vehicles", "ok", "Template-punkt blev gemt.");
}

export async function removeChecklistTemplateItemAction(templateId: string, itemId: string) {
  const actor = await requireVehicleManager();
  const item = await prisma.vehicleChecklistTemplateItem.delete({
    where: { id: itemId },
    select: { id: true, label: true },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "checklist_template_item_removed",
    target: `vehicle-template:${templateId}`,
    details: { itemId: item.id, label: item.label },
  });

  revalidatePath("/admin/vehicles");
  redirectWithMessage("/admin/vehicles", "ok", "Template-punkt blev fjernet.");
}
