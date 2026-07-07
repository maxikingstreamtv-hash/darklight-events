export type ResultStatus = "pending" | "approved" | "rejected";

export type ResultScore = {
  id: string;
  eventId: string;
  driverId: string;
  heatId: string;
  runNumber: number;
  judge: string;
  style: number;
  speed: number;
  angle: number;
  line: number;
  penalty: number;
  total: number;
  time?: number;
  penaltySeconds?: number;
  finalTime?: number;
  notes?: string;
  placement?: number;
  resultType?: "score" | "time" | "placement";
  status: ResultStatus;
  createdAt: string;
};

export type EventResult = {
  eventId: string;
  heatId: string;
  scores: ResultScore[];
  status: ResultStatus;
  winnerDriverId?: string;
};

export type PublishedHallOfFameWinner = {
  id: string;
  eventId: string;
  driverId: string;
  placement: 1 | 2 | 3;
  publishedBy: string;
  publishedAt: string;
  notes?: string;
};

export const cleanResultScores: ResultScore[] = [];

export const cleanPublishedHallOfFameWinners: PublishedHallOfFameWinner[] = [];

export const demoResultScores: ResultScore[] = [
  {
    id: "RS-001",
    eventId: "drift-championship-01",
    driverId: "cole-kane",
    heatId: "heat-1",
    runNumber: 1,
    judge: "Mason Vega",
    style: 24,
    speed: 23,
    angle: 25,
    line: 24,
    penalty: 0,
    total: 96,
    status: "approved",
    createdAt: "2026-07-12T20:14:00.000Z",
  },
  {
    id: "RS-002",
    eventId: "drift-championship-01",
    driverId: "izadora-solis",
    heatId: "heat-1",
    runNumber: 1,
    judge: "Mason Vega",
    style: 23,
    speed: 22,
    angle: 23,
    line: 23,
    penalty: 1,
    total: 90,
    status: "approved",
    createdAt: "2026-07-12T20:17:00.000Z",
  },
  {
    id: "RS-003",
    eventId: "drift-championship-01",
    driverId: "alex-corleone",
    heatId: "heat-2",
    runNumber: 1,
    judge: "Nora Vale",
    style: 21,
    speed: 24,
    angle: 20,
    line: 22,
    penalty: 0,
    total: 87,
    status: "approved",
    createdAt: "2026-07-12T20:21:00.000Z",
  },
  {
    id: "RS-004",
    eventId: "drift-championship-01",
    driverId: "cole-kane",
    heatId: "heat-2",
    runNumber: 2,
    judge: "Nora Vale",
    style: 25,
    speed: 24,
    angle: 24,
    line: 25,
    penalty: 2,
    total: 96,
    status: "pending",
    createdAt: "2026-07-12T20:28:00.000Z",
  },
  {
    id: "RS-005",
    eventId: "car-show-night-01",
    driverId: "izadora-solis",
    heatId: "heat-3",
    runNumber: 1,
    judge: "Avery Cross",
    style: 25,
    speed: 18,
    angle: 21,
    line: 24,
    penalty: 0,
    total: 88,
    status: "pending",
    createdAt: "2026-07-19T21:12:00.000Z",
  },
  {
    id: "RS-006",
    eventId: "car-show-night-01",
    driverId: "alex-corleone",
    heatId: "heat-3",
    runNumber: 1,
    judge: "Avery Cross",
    style: 18,
    speed: 19,
    angle: 17,
    line: 20,
    penalty: 5,
    total: 69,
    status: "rejected",
    createdAt: "2026-07-19T21:18:00.000Z",
  },
];

export const demoPublishedHallOfFameWinners: PublishedHallOfFameWinner[] = [
  {
    id: "HOF-DEMO-001",
    eventId: "drift-championship-01",
    driverId: "cole-kane",
    placement: 1,
    publishedBy: "Cole Kane",
    publishedAt: "2026-07-12T21:30:00.000Z",
    notes: "Demo winner only. Not official RP history.",
  },
];

export const resultScores: ResultScore[] = cleanResultScores;

export const publishedHallOfFameWinners: PublishedHallOfFameWinner[] =
  cleanPublishedHallOfFameWinners;
