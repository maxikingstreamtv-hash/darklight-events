export type StaffMember = {
  id: string;
  characterName: string;
  role: string;
  darklightId: string;
  department: "Ledelse" | "Event Managers" | "Judges" | "Crew" | "Fotografer" | "Sikkerhed";
  responsibilities: string[];
  status: "Aktiv" | "Afventer" | "Pause";
  initials: string;
};

export const staffMembers: StaffMember[] = [
  {
    id: "cole-kane",
    characterName: "Cole Kane",
    role: "Founder / CEO",
    darklightId: "DL-00001",
    department: "Ledelse",
    responsibilities: ["EventOS", "Booking", "Tilladelser", "Staff-koordinering"],
    status: "Aktiv",
    initials: "CK",
  },
  {
    id: "izadora-solis",
    characterName: "Izadora Solis",
    role: "Co-Founder",
    darklightId: "DL-00002",
    department: "Ledelse",
    responsibilities: ["Eventflow", "Dommerpanel", "Køreroplevelse", "Hall of Fame"],
    status: "Aktiv",
    initials: "IS",
  },
  {
    id: "event-manager-pool",
    characterName: "Event Manager Team",
    role: "Event Managers",
    darklightId: "DL-STAFF",
    department: "Event Managers",
    responsibilities: ["Check-in", "Heat-flow", "Deltagerkø"],
    status: "Afventer",
    initials: "EM",
  },
  {
    id: "judge-pool",
    characterName: "Judge Team",
    role: "Judges",
    darklightId: "DL-JUDGE",
    department: "Judges",
    responsibilities: ["Point", "Tider", "Penalties"],
    status: "Afventer",
    initials: "JG",
  },
];

