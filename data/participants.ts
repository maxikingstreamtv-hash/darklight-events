export type Participant = {
  id: string;
  driverId: string;
  checkedIn: boolean;
};

export const participants: Participant[] = [
  {
    id: "P-001",
    driverId: "cole-kane",
    checkedIn: true,
  },
  {
    id: "P-002",
    driverId: "izadora-solis",
    checkedIn: false,
  },
  {
    id: "P-003",
    driverId: "alex-corleone",
    checkedIn: true,
  },
];