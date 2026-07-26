import type { AppRole } from "@/lib/auth/types";
import type { EventFeatures } from "@/lib/events/event-features";

export type CommandCenterTabKey =
  | "overview"
  | "details"
  | "participants"
  | "vehicles"
  | "heats"
  | "bracket"
  | "results"
  | "prizes"
  | "media"
  | "settings"
  | "live"
  | "tablet";

export type CommandCenterTab = {
  key: CommandCenterTabKey;
  label: string;
  hash: string;
};

const tabs: Array<CommandCenterTab & { enabled?: (features: EventFeatures) => boolean }> = [
  { key: "overview", label: "Overblik", hash: "#oversigt" },
  { key: "details", label: "Eventoplysninger", hash: "#eventoplysninger" },
  { key: "participants", label: "Deltagere", hash: "#deltagere", enabled: (event) => event.usesParticipantRegistration },
  { key: "vehicles", label: "Køretøjer", hash: "#køretøjer", enabled: (event) => event.usesVehicles },
  { key: "heats", label: "Køreliste", hash: "#køreliste", enabled: (event) => event.usesHeats },
  { key: "bracket", label: "Bracket", hash: "#bracket", enabled: (event) => event.usesBracket },
  { key: "results", label: "Resultater", hash: "#resultater", enabled: (event) => event.usesResults },
  { key: "prizes", label: "Præmier", hash: "#præmier", enabled: (event) => event.usesPrizes },
  { key: "media", label: "Billeder og visning", hash: "#medier" },
  { key: "settings", label: "Indstillinger", hash: "#indstillinger" },
  { key: "live", label: "Live", hash: "#live" },
  { key: "tablet", label: "Tablet", hash: "#tablet" },
];

export function canManageEventCommandCenter(role: AppRole) {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "EVENT_MANAGER";
}

export function canUseDangerousEventActions(role: AppRole) {
  return role === "SUPER_ADMIN";
}

export function getCommandCenterTabs(features: EventFeatures) {
  return tabs
    .filter((tab) => !tab.enabled || tab.enabled(features))
    .map((tab) => ({ key: tab.key, label: tab.label, hash: tab.hash }));
}

export function resolveCommandCenterTab(requested: string | undefined, features: EventFeatures): CommandCenterTabKey {
  const visible = getCommandCenterTabs(features);
  return visible.some((tab) => tab.key === requested) ? requested as CommandCenterTabKey : "overview";
}

export function commandCenterHref(eventId: string, tab: CommandCenterTabKey) {
  const definition = tabs.find((item) => item.key === tab);
  return `/competition/events/${eventId}?tab=${tab}${definition?.hash ?? "#oversigt"}`;
}
