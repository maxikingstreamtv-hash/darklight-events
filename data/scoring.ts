export type PlacementPoint = {
  placement: number;
  points: number;
};

export const placementPoints: PlacementPoint[] = [
  { placement: 1, points: 25 },
  { placement: 2, points: 18 },
  { placement: 3, points: 15 },
  { placement: 4, points: 12 },
  { placement: 5, points: 10 },
  { placement: 6, points: 8 },
  { placement: 7, points: 6 },
  { placement: 8, points: 4 },
  { placement: 9, points: 2 },
  { placement: 10, points: 1 },
];

export const driftScoring = [
  "Line",
  "Angle",
  "Style",
  "Smoke",
];

export const carShowScoring = [
  "Eksteriør",
  "Interiør",
  "Originalitet",
  "Detaljer",
  "Præsentation",
];

export const dreamlightScoring = [
  "Påklædning",
  "Præsentation",
  "Personlighed",
  "Karisma",
  "Publikum",
];

export const derbyScoring = [
  "Elimineringer",
  "Overlevelse",
  "Skade",
  "Aggressivitet",
  "Publikumsværdi",
];

export const motocrossScoring = [
  "Placering",
  "Bedste omgang",
  "Samlet tid",
  "Fejl",
];

export const dragScoring = [
  "Reaction Time",
  "Sluttid",
  "Top Speed",
  "Vinder",
];

export const raceScoring = [
  "Placering",
  "Bedste omgang",
  "Samlet tid",
  "Point",
];
