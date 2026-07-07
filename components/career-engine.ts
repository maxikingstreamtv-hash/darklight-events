import { careerRewards, careerXP, type Career } from "@/data/career";
import type { Driver } from "@/data/drivers";
import type { ResultScore } from "@/data/results";
import { getApprovedResults, getDriverResults, getDriverStats, sortResultsForPlacement } from "@/components/competition/result-engine";
import { getDriverStanding } from "@/components/competition/season-engine";

function getEventFinishes(results: ResultScore[], driverId: string) {
  const groupedByEvent = getApprovedResults(results).reduce<Record<string, ResultScore[]>>((groups, result) => {
    groups[result.eventId] = [...(groups[result.eventId] ?? []), result];
    return groups;
  }, {});

  return Object.values(groupedByEvent)
    .map((eventResults) => sortResultsForPlacement(eventResults).findIndex((result) => result.driverId === driverId) + 1)
    .filter((finish) => finish > 0);
}

export function calculateXP(driver: Driver, results: ResultScore[]) {
  const driverResults = getApprovedResults(getDriverResults(results, driver.id));
  const finishes = getEventFinishes(results, driver.id);
  const completedXP = driverResults.length * careerXP.eventCompleted;
  const podiumXP = finishes.filter((finish) => finish > 1 && finish <= 3).length * careerXP.podium;
  const winXP = finishes.filter((finish) => finish === 1).length * careerXP.win;
  const perfectRunXP = driverResults.filter((result) => result.total >= 95).length * careerXP.perfectRun;

  return driver.xp + completedXP + podiumXP + winXP + perfectRunXP;
}

export function calculateLevel(xp: number) {
  return Math.max(Math.floor(xp / 500) + 1, 1);
}

export function getNextReward(level: number) {
  return careerRewards.find((reward) => reward.level > level)?.reward ?? "Legende-belønninger låst op";
}

export function getTitles(driver: Driver, results: ResultScore[]) {
  const standing = getDriverStanding(driver.id, results);
  const stats = getDriverStats(results, driver.id);
  const driverResults = getApprovedResults(getDriverResults(results, driver.id));
  const titles = ["Registreret kører"];

  if (standing.position === 1) titles.push("Champion");
  if (stats.podiums >= 1) titles.push("Podietrussel");
  if (driverResults.some((result) => result.total >= 95)) titles.push("Perfect Run Club");
  if (stats.wins >= 1) titles.push("Eventvinder");

  return titles;
}

export function getCareer(driver: Driver, results: ResultScore[]): Career {
  const xp = calculateXP(driver, results);
  const level = calculateLevel(xp);
  const standing = getDriverStanding(driver.id, results);
  const titles = getTitles(driver, results);
  const reputation = level >= 25 ? "Legende" : level >= 15 ? "Pro" : level >= 8 ? "På vej op" : "Rookie";

  return {
    level,
    xp,
    reputation,
    titles,
    unlockedAchievements: [
      `${standing.eventsRun} sæsonevents`,
      `${standing.wins} sejre`,
      `${standing.podiums} podier`,
      `${standing.averageScore || 0} gennemsnitlig score`,
    ],
    nextReward: getNextReward(level),
  };
}

