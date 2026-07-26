import type { EventFeatures } from "./event-features";

export type DisciplinePreset = EventFeatures & {
  id: string;
  name: string;
  description: string;
  abbreviation: string;
  category: string | null;
  active: boolean;
  sortOrder: number;
};

export function disciplineFeatures(discipline: DisciplinePreset): EventFeatures {
  return {
    usesParticipantRegistration: discipline.usesParticipantRegistration,
    usesVehicles: discipline.usesVehicles,
    requiresVehicleApproval: discipline.usesVehicles && discipline.requiresVehicleApproval,
    usesHeats: discipline.usesHeats,
    usesBracket: discipline.usesBracket,
    usesResults: discipline.usesResults,
    usesPrizes: discipline.usesPrizes,
  };
}

export function publicDisciplines<T extends { active: boolean; sortOrder: number; name: string }>(disciplines: T[]) {
  return disciplines
    .filter((discipline) => discipline.active)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "da"));
}

export function canManageDisciplines(role: string) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canSelectDisciplineForEvent(role: string) {
  return canManageDisciplines(role) || role === "EVENT_MANAGER";
}
