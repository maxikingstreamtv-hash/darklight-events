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

export const sponsors: Sponsor[] = [];

