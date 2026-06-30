export type Driver = {
  id: string;
  darklightId: string;
  name: string;
  role: string;
  favoriteVehicle: string;
  level: number;
  xp: number;
  events: number;
  wins: number;
  podiums: number;
};

export const drivers: Driver[] = [
  {
    id: "cole-kane",
    darklightId: "DL-0001",
    name: "Cole Kane",
    role: "Driver / Competitor",
    favoriteVehicle: "Nissan Silvia S15",
    level: 23,
    xp: 3200,
    events: 12,
    wins: 4,
    podiums: 8,
  },
  {
    id: "izadora-solis",
    darklightId: "DL-0002",
    name: "Izadora Solis",
    role: "Show Competitor",
    favoriteVehicle: "Benefactor Schlagen GT",
    level: 21,
    xp: 2850,
    events: 10,
    wins: 3,
    podiums: 7,
  },
  {
    id: "alex-corleone",
    darklightId: "DL-0003",
    name: "Alex Corleone",
    role: "Racer",
    favoriteVehicle: "BMW M3",
    level: 16,
    xp: 1900,
    events: 8,
    wins: 1,
    podiums: 4,
  },
];