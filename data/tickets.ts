export type PlayerTicket = {
  id: string;
  eventId: string;
  driverId: string;
  vehicleId: string;
  gridSlot: string;
  status: "active" | "used" | "cancelled";
};

export const playerTickets: PlayerTicket[] = [
  {
    id: "DL-TICKET-001",
    eventId: "drift-championship-01",
    driverId: "cole-kane",
    vehicleId: "veh-001",
    gridSlot: "Grid A-04",
    status: "active",
  },
  {
    id: "DL-TICKET-002",
    eventId: "car-show-night-01",
    driverId: "izadora-solis",
    vehicleId: "veh-007",
    gridSlot: "Show Slot B-02",
    status: "active",
  },
];
