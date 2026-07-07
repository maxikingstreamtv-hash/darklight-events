export type PermissionStatus = "Godkendt" | "Afventer" | "Afvist" | "Arkiveret";

export type PermissionItem = {
  id: string;
  event: string;
  location: string;
  status: PermissionStatus;
  authority: string;
  applicant: string;
  date: string;
  comment: string;
  documentRef: string;
};

export const permissions: PermissionItem[] = [
  {
    id: "permit-drift-01",
    event: "Drift Championship",
    location: "DreamLight Track",
    status: "Afventer",
    authority: "Eventkoordinering",
    applicant: "Cole Kane",
    date: "2026-07-02",
    comment: "Afventer endelig lokationsbriefing og crew-plan.",
    documentRef: "eventmanual",
  },
  {
    id: "permit-carmeet-01",
    event: "Car Meet Night",
    location: "Vinewood Parking",
    status: "Godkendt",
    authority: "Byens eventkanaler",
    applicant: "Izadora Solis",
    date: "2026-07-02",
    comment: "Godkendt til socialt biltræf med staff ved indgang og parkering.",
    documentRef: "crew-manual",
  },
  {
    id: "permit-drag-01",
    event: "Drag Race Ladder",
    location: "Sandy Shores Airfield",
    status: "Afventer",
    authority: "Eventkoordinering",
    applicant: "Cole Kane",
    date: "2026-07-02",
    comment: "Kræver staging-plan og tydelige start-/målzoner.",
    documentRef: "dommermanual",
  },
];

