export type AchievementCategory = "karriere" | "events" | "garage" | "resultater";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  xpReward: number;
  target: number;
};

export const achievements: Achievement[] = [
  {
    id: "first-event",
    title: "Første event",
    description: "Få dit første godkendte resultat i et DarkLight event.",
    category: "events",
    xpReward: 100,
    target: 1,
  },
  {
    id: "first-podium",
    title: "Første podie",
    description: "Opnå din første top 3-placering.",
    category: "karriere",
    xpReward: 200,
    target: 1,
  },
  {
    id: "first-win",
    title: "Første sejr",
    description: "Slut som nummer 1 i et event.",
    category: "karriere",
    xpReward: 350,
    target: 1,
  },
  {
    id: "five-events",
    title: "5 events deltaget",
    description: "Deltag i fem events med godkendte resultater.",
    category: "events",
    xpReward: 250,
    target: 5,
  },
  {
    id: "ten-events",
    title: "10 events deltaget",
    description: "Deltag i ti events med godkendte resultater.",
    category: "events",
    xpReward: 500,
    target: 10,
  },
  {
    id: "drift-debut",
    title: "Drift-debut",
    description: "Få et godkendt resultat i et drift-event.",
    category: "resultater",
    xpReward: 150,
    target: 1,
  },
  {
    id: "time-master",
    title: "Tidsmester",
    description: "Registrer en godkendt tid fra racing tablet.",
    category: "resultater",
    xpReward: 150,
    target: 1,
  },
  {
    id: "stable-driver",
    title: "Stabil kører",
    description: "Opnå tre top 10-resultater.",
    category: "resultater",
    xpReward: 225,
    target: 3,
  },
  {
    id: "garage-built",
    title: "Garage klar",
    description: "Registrer mindst tre RP-køretøjer i din garage.",
    category: "garage",
    xpReward: 150,
    target: 3,
  },
];

