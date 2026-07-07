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
    darklightId: "DL-00001",
    name: "Cole Kane",
    role: "Kører / Deltager",
    favoriteVehicle: "Nissan Silvia S15",
    level: 1,
    xp: 0,
    events: 0,
    wins: 0,
    podiums: 0,
  },
  {
    id: "izadora-solis",
    darklightId: "DL-00002",
    name: "Izadora Solis",
    role: "Showdeltager",
    favoriteVehicle: "Benefactor Schlagen GT",
    level: 1,
    xp: 0,
    events: 0,
    wins: 0,
    podiums: 0,
  },
  {
    id: "alex-corleone",
    darklightId: "DL-00003",
    name: "Alex Corleone",
    role: "Racer",
    favoriteVehicle: "BMW M3",
    level: 1,
    xp: 0,
    events: 0,
    wins: 0,
    podiums: 0,
  },
];
