export const EVENT_RESULT_METHODS = [
  "NONE", "TIME_ONLY", "POINTS_ONLY", "TIME_AND_POINTS", "PLACEMENT_ONLY",
  "TIME_TO_POINTS", "JUDGE_POINTS", "JUDGE_AND_PUBLIC_VOTE", "PUBLIC_VOTE_ONLY", "BRACKET",
] as const;

export type EventResultMethodValue = (typeof EVENT_RESULT_METHODS)[number];

export const RESULT_METHOD_LABELS: Record<EventResultMethodValue, string> = {
  NONE: "Ingen resultater",
  TIME_ONLY: "Kun tid",
  POINTS_ONLY: "Kun point",
  TIME_AND_POINTS: "Tid og point",
  PLACEMENT_ONLY: "Kun placering",
  TIME_TO_POINTS: "Tid omregnet til point",
  JUDGE_POINTS: "Dommerbedømmelse",
  JUDGE_AND_PUBLIC_VOTE: "Dommerpoint og publikumsstemmer",
  PUBLIC_VOTE_ONLY: "Kun publikumsstemmer",
  BRACKET: "Bracket / knockout",
};

export const RESULT_METHOD_DESCRIPTIONS: Record<EventResultMethodValue, string> = {
  NONE: "Eventet har ingen resultatregistrering.",
  TIME_ONLY: "Tider afgør placeringen. Pointfelt skjules.",
  POINTS_ONLY: "Placeringen afgøres af højeste point.",
  TIME_AND_POINTS: "Tid og point registreres på samme resultat.",
  PLACEMENT_ONLY: "Placering registreres uden krav om tid eller point.",
  TIME_TO_POINTS: "Tiden afgør placeringen og kan omregnes til point.",
  JUDGE_POINTS: "Tildelte dommere giver point, som er skjult indtil offentliggørelse.",
  JUDGE_AND_PUBLIC_VOTE: "Tildelte dommere giver point. Hver registreret brugerstemme giver 1 ekstra point. Point er skjult indtil offentliggørelse.",
  PUBLIC_VOTE_ONLY: "Hver registreret bruger har én aktiv stemme. Stillingen er skjult indtil offentliggørelse.",
  BRACKET: "Vinderen findes gennem bracket / knockout.",
};

export type ResultMethodFeatures = {
  usesResults: boolean;
  usesBracket: boolean;
  usesHeats: boolean;
  usesJudging: boolean;
  usesPublicVoting: boolean;
};

export function isEventResultMethod(value: unknown): value is EventResultMethodValue {
  return typeof value === "string" && EVENT_RESULT_METHODS.includes(value as EventResultMethodValue);
}

export function suggestedResultFeatures(method: EventResultMethodValue): ResultMethodFeatures {
  return {
    usesResults: method !== "NONE",
    usesBracket: method === "BRACKET",
    usesHeats: ["TIME_ONLY", "TIME_AND_POINTS", "TIME_TO_POINTS"].includes(method),
    usesJudging: method === "JUDGE_POINTS" || method === "JUDGE_AND_PUBLIC_VOTE",
    usesPublicVoting: method === "PUBLIC_VOTE_ONLY" || method === "JUDGE_AND_PUBLIC_VOTE",
  };
}

export function requiresPrivatePublication(method: EventResultMethodValue) {
  return method === "JUDGE_POINTS" || method === "JUDGE_AND_PUBLIC_VOTE" || method === "PUBLIC_VOTE_ONLY";
}

export function assertValidResultConfiguration(method: EventResultMethodValue, features: { usesResults: boolean; usesBracket: boolean }) {
  const suggested = suggestedResultFeatures(method);
  if (suggested.usesResults && !features.usesResults) throw new Error("Den valgte resultatmetode kræver Resultater.");
  if (method === "NONE" && features.usesResults) throw new Error("Ingen resultater kan ikke kombineres med Resultater.");
  if (method === "BRACKET" && !features.usesBracket) throw new Error("Bracket-resultater kræver bracket-funktionen.");
  if (method !== "BRACKET" && features.usesBracket && method === "NONE") throw new Error("Bracket kan ikke bruges uden en resultatmetode.");
}

export function readResultMethod(formData: FormData): EventResultMethodValue {
  const value = formData.get("resultMethod");
  return isEventResultMethod(value) ? value : "TIME_AND_POINTS";
}
