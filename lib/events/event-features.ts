export type EventFeatures = {
  usesParticipantRegistration: boolean;
  usesVehicles: boolean;
  requiresVehicleApproval: boolean;
  usesHeats: boolean;
  usesBracket: boolean;
  usesResults: boolean;
  usesPrizes: boolean;
};

export const NEW_EVENT_FEATURE_DEFAULTS: EventFeatures = {
  usesParticipantRegistration: true,
  usesVehicles: false,
  requiresVehicleApproval: false,
  usesHeats: false,
  usesBracket: false,
  usesResults: true,
  usesPrizes: true,
};

export function readEventFeatures(formData: FormData): EventFeatures {
  const usesVehicles = formData.get("usesVehicles") === "on";
  return {
    usesParticipantRegistration: formData.get("usesParticipantRegistration") === "on",
    usesVehicles,
    requiresVehicleApproval: usesVehicles && formData.get("requiresVehicleApproval") === "on",
    usesHeats: formData.get("usesHeats") === "on",
    usesBracket: formData.get("usesBracket") === "on",
    usesResults: formData.get("usesResults") === "on",
    usesPrizes: formData.get("usesPrizes") === "on",
  };
}

export type WorkflowFacts = {
  eventCreated: boolean;
  registrationOpen: boolean;
  participantsReady: boolean;
  vehiclesReady: boolean;
  heatsReady: boolean;
  bracketReady: boolean;
  resultsReady: boolean;
  completed: boolean;
};

export function getConfiguredWorkflow(features: EventFeatures, facts: WorkflowFacts) {
  return [
    { key: "created", label: "Event oprettet", tab: "settings", action: "Åbn event", done: facts.eventCreated, relevant: true },
    { key: "registration", label: "Tilmelding åben", tab: "participants", action: "Åbn tilmelding", done: facts.registrationOpen, relevant: features.usesParticipantRegistration },
    { key: "participants", label: "Godkend deltagere", tab: "participants", action: "Godkend deltagere", done: facts.participantsReady, relevant: features.usesParticipantRegistration },
    { key: "vehicles", label: "Godkend køretøjer", tab: "vehicles", action: "Godkend køretøjer", done: facts.vehiclesReady, relevant: features.usesVehicles && features.requiresVehicleApproval },
    { key: "heats", label: "Lav køreliste", tab: "heats", action: "Lav køreliste", done: facts.heatsReady, relevant: features.usesHeats },
    { key: "bracket", label: "Generér bracket", tab: "bracket", action: "Generér bracket", done: facts.bracketReady, relevant: features.usesBracket },
    { key: "results", label: "Indtast resultater", tab: "results", action: "Indtast resultater", done: facts.resultsReady, relevant: features.usesResults },
    { key: "completed", label: "Afslut event", tab: "settings", action: "Afslut event", done: facts.completed, relevant: true },
  ].filter((step) => step.relevant);
}

export function assertEventFeature(enabled: boolean, message: string): asserts enabled {
  if (!enabled) throw new Error(message);
}
