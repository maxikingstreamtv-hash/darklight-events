export type ManagedEvent = {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  status: "Ready" | "Live" | "Paused" | "Finished" | "Archived";
  participants: number;
  maxParticipants: number;
  href: string;
};

export const managedEvents: ManagedEvent[] = [
  {
    id: "drift-championship-01",
    title: "Drift Championship #01",
    type: "Drift",
    date: "2026-07-12",
    time: "20:00",
    location: "Los Santos Car Meet",
    status: "Ready",
    participants: 0,
    maxParticipants: 32,
    href: "/competition/events/drift-championship-01",
  },
  {
    id: "car-show-night-01",
    title: "Car Show Night #01",
    type: "Car Show",
    date: "2026-07-19",
    time: "21:00",
    location: "Vinewood Parking",
    status: "Ready",
    participants: 0,
    maxParticipants: 40,
    href: "/competition/events/car-show-night-01",
  },
];
