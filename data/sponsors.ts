export type SponsorLevel = "Platinum" | "Gold" | "Silver" | "Partner";

export type Sponsor = {
  id: string;
  name: string;
  level: SponsorLevel;
  contactPerson: string;
  partnerSince: string;
  eventsSupported: string[];
  description: string;
  logoInitials: string;
  status: "Aktiv" | "Afventer" | "Arkiveret";
};

export const sponsorLevels: SponsorLevel[] = ["Platinum", "Gold", "Silver", "Partner"];

export const sponsors: Sponsor[] = [
  {
    id: "mirror-park-customs",
    name: "Mirror Park Customs",
    level: "Gold",
    contactPerson: "Milo Vance",
    partnerSince: "2026-07-02",
    eventsSupported: ["Car Meet Night", "Show & Shine"],
    description: "Støtter biltræf og show-events med præmier, stylingtemaer og RP-crew.",
    logoInitials: "MPC",
    status: "Aktiv",
  },
  {
    id: "nightline-media",
    name: "Nightline Media",
    level: "Partner",
    contactPerson: "Sia North",
    partnerSince: "2026-07-02",
    eventsSupported: ["Festival Night", "Car Meet Night"],
    description: "Dækker udvalgte events med billeder, korte recaps og eventstemning.",
    logoInitials: "NM",
    status: "Afventer",
  },
  {
    id: "apex-performance",
    name: "Apex Performance",
    level: "Platinum",
    contactPerson: "Rico Vale",
    partnerSince: "2026-07-02",
    eventsSupported: ["Drift Championship", "Drag Race Ladder"],
    description: "Performance-partner til motorsport med præmiepuljer og køretøjsfokus.",
    logoInitials: "AP",
    status: "Aktiv",
  },
];

