import { achievements, type Achievement } from "@/data/achievements";
import type { Driver } from "@/data/drivers";
import type { ResultScore } from "@/data/results";
import type { Vehicle } from "@/data/vehicles";
import { getApprovedResults, getDriverResults, getDriverStats } from "@/components/competition/result-engine";

export type AchievementProgress = Achievement & {
  progress: number;
  unlocked: boolean;
};

export function getAchievementProgress(
  achievement: Achievement,
  driver: Driver,
  results: ResultScore[],
  vehicles: Vehicle[]
): AchievementProgress {
  const driverResults = getApprovedResults(getDriverResults(results, driver.id));
  const stats = getDriverStats(results, driver.id);
  const driverVehicles = vehicles.filter((vehicle) => vehicle.ownerDriverId === driver.id);

  const progressByAchievement: Record<string, number> = {
    "first-event": stats.eventsParticipated,
    "first-podium": stats.podiums,
    "first-win": stats.wins,
    "five-events": stats.eventsParticipated,
    "ten-events": stats.eventsParticipated,
    "drift-debut": driverResults.filter((result) => result.eventId.toLowerCase().includes("drift")).length,
    "time-master": driverResults.filter((result) => result.resultType === "time").length,
    "stable-driver": stats.top10,
    "garage-built": driverVehicles.length,
  };

  const progress = progressByAchievement[achievement.id] ?? 0;

  return {
    ...achievement,
    progress,
    unlocked: progress >= achievement.target,
  };
}

export function getAchievements(driver: Driver, results: ResultScore[], vehicles: Vehicle[]) {
  return achievements.map((achievement) => getAchievementProgress(achievement, driver, results, vehicles));
}

export function getUnlockedAchievements(driver: Driver, results: ResultScore[], vehicles: Vehicle[]) {
  return getAchievements(driver, results, vehicles).filter((achievement) => achievement.unlocked);
}

export function getAchievementXP(driver: Driver, results: ResultScore[], vehicles: Vehicle[]) {
  return getUnlockedAchievements(driver, results, vehicles).reduce((sum, achievement) => sum + achievement.xpReward, 0);
}
