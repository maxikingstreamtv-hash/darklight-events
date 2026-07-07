export type Participant = {
  id: string;
  driverId: string;
  eventId: string;
  checkedIn: boolean;
};

export const cleanParticipants: Participant[] = [];

export const demoParticipants: Participant[] = [
  {
    id: "P-001",
    driverId: "cole-kane",
    eventId: "drift-championship-01",
    checkedIn: true,
  },
  {
    id: "P-002",
    driverId: "izadora-solis",
    eventId: "drift-championship-01",
    checkedIn: false,
  },
  {
    id: "P-003",
    driverId: "alex-corleone",
    eventId: "car-show-night-01",
    checkedIn: true,
  },
];

export const participants: Participant[] = cleanParticipants;
