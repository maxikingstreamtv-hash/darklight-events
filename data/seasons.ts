export type Season = {
  id: string;
  title: string;
  status: "active" | "archived";
  startDate: string;
  endDate: string;
  eventIds: string[];
};

export type SeasonPoints = {
  win: number;
  podium: number;
  approvedScore: number;
  scoreMultiplier: number;
};

export type SeasonStanding = {
  seasonId: string;
  driverId: string;
  position: number;
  points: number;
  eventsRun: number;
  wins: number;
  podiums: number;
  averageScore: number;
  averageFinish: number;
};

export const seasonPoints: SeasonPoints = {
  win: 25,
  podium: 12,
  approvedScore: 5,
  scoreMultiplier: 0.5,
};

export const seasons: Season[] = [
  {
    id: "season-01",
    title: "Season 01",
    status: "active",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    eventIds: ["drift-championship-01", "car-show-night-01"],
  },
];
