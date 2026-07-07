export type DocumentCategory =
  | "Tilladelser"
  | "Eventregler"
  | "Samarbejdsaftaler"
  | "Sponsoroversigt"
  | "Eventmanual"
  | "Dommermanual"
  | "Crew-manual";

export type DocumentItem = {
  id: string;
  title: string;
  category: DocumentCategory;
  status: "Aktiv" | "Under review" | "Arkiveret";
  summary: string;
  updatedAt: string;
  owner: string;
  visibility: "Offentlig" | "Staff";
  content: string[];
};

export const documentCategories: DocumentCategory[] = [
  "Tilladelser",
  "Eventregler",
  "Samarbejdsaftaler",
  "Sponsoroversigt",
  "Eventmanual",
  "Dommermanual",
  "Crew-manual",
];

export const documents: DocumentItem[] = [
  {
    id: "eventmanual",
    title: "DarkLight Eventmanual",
    category: "Eventmanual",
    status: "Aktiv",
    summary: "Grundflow for planlægning, check-in, afvikling og afslutning af events.",
    updatedAt: "2026-07-02",
    owner: "Cole Kane",
    visibility: "Offentlig",
    content: [
      "DarkLight Events planlægger events med tydelig briefing, deltagerliste, check-in og staff-roller.",
      "Alle events afvikles manuelt gennem DarkLight EventOS og koordineres i DreamLight RP-universet.",
      "Efter et event kan staff godkende resultater, offentliggøre vindere og opdatere Hall of Fame.",
    ],
  },
  {
    id: "dommermanual",
    title: "Dommermanual",
    category: "Dommermanual",
    status: "Aktiv",
    summary: "Retningslinjer for point, tider, penalties og godkendelse af resultater.",
    updatedAt: "2026-07-02",
    owner: "Izadora Solis",
    visibility: "Offentlig",
    content: [
      "Dommerpanelet vurderer ud fra eventtypen: Drift og Show & Shine bruger score, mens Drag Race og offroad bruger tid.",
      "Alle resultater oprettes manuelt og skal godkendes af staff, før de tæller på ranglisten.",
      "Noter skal være korte, konkrete og brugbare for både kører og eventcrew.",
    ],
  },
  {
    id: "crew-manual",
    title: "Crew-manual",
    category: "Crew-manual",
    status: "Aktiv",
    summary: "Crew-flow til staging, sikkerhed, kø, radio og publikumsstyring.",
    updatedAt: "2026-07-02",
    owner: "DarkLight Staff",
    visibility: "Offentlig",
    content: [
      "Crew holder eventområdet rent, styrer køen og hjælper med information til deltagere.",
      "Sikkerhed og flow prioriteres over hastighed. Eventet skal føles kontrolleret og klart.",
      "Alle større ændringer meldes til EventOS-staff, før de kommunikeres offentligt.",
    ],
  },
  {
    id: "sponsoroversigt",
    title: "Sponsoroversigt",
    category: "Sponsoroversigt",
    status: "Under review",
    summary: "Oversigt over aktive partnere og hvilke events de støtter.",
    updatedAt: "2026-07-02",
    owner: "Cole Kane",
    visibility: "Offentlig",
    content: [
      "Sponsorater er RP-aftaler mellem DarkLight Events og partnere i DreamLight.",
      "En sponsor kan støtte præmier, lokation, crew eller markedsføring i byen.",
      "Alle aftaler skal godkendes af DarkLight staff, før de vises offentligt.",
    ],
  },
];

