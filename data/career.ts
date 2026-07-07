export type CareerXPReason =
  | "eventCompleted"
  | "podium"
  | "win"
  | "perfectRun";

export type Career = {
  level: number;
  xp: number;
  reputation: string;
  titles: string[];
  unlockedAchievements: string[];
  nextReward: string;
};

export const careerXP = {
  eventCompleted: 100,
  podium: 250,
  win: 500,
  perfectRun: 150,
} satisfies Record<CareerXPReason, number>;

export const careerRewards = [
  { level: 5, reward: "Street Rookie titel" },
  { level: 10, reward: "Priority Check-in badge" },
  { level: 15, reward: "Garage Showcase plads" },
  { level: 20, reward: "Pro kører titel" },
  { level: 25, reward: "Champion Grid banner" },
  { level: 30, reward: "DarkLight Legend titel" },
];

