import type { ManagedEvent } from "@/data/event-manager";
import { eventTemplates } from "@/data/event-templates";

export function getTemplates() {
  return eventTemplates;
}

export function getTemplate(id: string) {
  return eventTemplates.find((template) => template.id === id);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function createEventFromTemplate(templateId: string): ManagedEvent | undefined {
  const template = getTemplate(templateId);

  if (!template) {
    return undefined;
  }

  return {
    id: `${slugify(template.name)}-draft`,
    title: `${template.name} #01`,
    type: template.type,
    date: "",
    time: "20:00",
    location: template.defaultLocation,
    status: template.defaultStatus,
    participants: 0,
    maxParticipants: template.defaultMaxParticipants,
    href: `/competition/events/${slugify(template.name)}-draft`,
  };
}
