export type HeatStatus = "waiting" | "ready" | "active" | "finished";

export type HeatEntry = {
  driverId: string;
  runNumber: number;
  completed: boolean;
};

export type Heat = {
  id: string;
  eventId: string;
  heatNumber: number;
  status: HeatStatus;
  driverIds: string[];
  currentDriver?: string;
  completedRuns: number;
};

export const cleanHeats: Heat[] = [
  {
    id: "heat-1",
    eventId: "drift-championship-01",
    heatNumber: 1,
    status: "ready",
    driverIds: [],
    completedRuns: 0,
  },
  {
    id: "heat-2",
    eventId: "drift-championship-01",
    heatNumber: 2,
    status: "waiting",
    driverIds: [],
    completedRuns: 0,
  },
  {
    id: "heat-3",
    eventId: "car-show-night-01",
    heatNumber: 1,
    status: "waiting",
    driverIds: [],
    completedRuns: 0,
  },
];

export const demoHeats: Heat[] = [
  {
    id: "heat-1",
    eventId: "drift-championship-01",
    heatNumber: 1,
    status: "finished",
    driverIds: ["cole-kane", "izadora-solis"],
    currentDriver: "izadora-solis",
    completedRuns: 2,
  },
  {
    id: "heat-2",
    eventId: "drift-championship-01",
    heatNumber: 2,
    status: "active",
    driverIds: ["izadora-solis", "alex-corleone"],
    currentDriver: "alex-corleone",
    completedRuns: 1,
  },
  {
    id: "heat-3",
    eventId: "drift-championship-01",
    heatNumber: 3,
    status: "ready",
    driverIds: ["cole-kane", "alex-corleone"],
    currentDriver: "cole-kane",
    completedRuns: 0,
  },
  {
    id: "heat-4",
    eventId: "drift-championship-01",
    heatNumber: 4,
    status: "waiting",
    driverIds: ["cole-kane", "izadora-solis"],
    currentDriver: "cole-kane",
    completedRuns: 0,
  },
  {
    id: "heat-5",
    eventId: "car-show-night-01",
    heatNumber: 5,
    status: "waiting",
    driverIds: ["izadora-solis", "alex-corleone"],
    currentDriver: "izadora-solis",
    completedRuns: 0,
  },
  {
    id: "heat-6",
    eventId: "car-show-night-01",
    heatNumber: 6,
    status: "waiting",
    driverIds: ["cole-kane", "alex-corleone"],
    currentDriver: "alex-corleone",
    completedRuns: 0,
  },
  {
    id: "heat-7",
    eventId: "drift-championship-01",
    heatNumber: 7,
    status: "waiting",
    driverIds: ["cole-kane", "izadora-solis", "alex-corleone"],
    currentDriver: "cole-kane",
    completedRuns: 0,
  },
  {
    id: "heat-8",
    eventId: "car-show-night-01",
    heatNumber: 8,
    status: "waiting",
    driverIds: ["alex-corleone", "cole-kane"],
    currentDriver: "alex-corleone",
    completedRuns: 0,
  },
];

export const heats: Heat[] = cleanHeats;
