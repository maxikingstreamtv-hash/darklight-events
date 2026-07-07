import { drivers, type Driver } from "@/data/drivers";
import { heats, type Heat, type HeatStatus } from "@/data/heats";
import { resultScores, type ResultScore } from "@/data/results";
import { getApprovedResults, getBestScore } from "@/components/competition/result-engine";

type HeatInput = {
  eventId: string;
  heatNumber: number;
  driverIds: string[];
  status?: HeatStatus;
};

export function createHeat(input: HeatInput): Heat {
  return {
    id: `heat-${input.heatNumber}`,
    eventId: input.eventId,
    heatNumber: input.heatNumber,
    status: input.status ?? "waiting",
    driverIds: input.driverIds,
    currentDriver: input.driverIds[0],
    completedRuns: 0,
  };
}

export function startHeat(heat: Heat): Heat {
  return {
    ...heat,
    status: "active",
    currentDriver: heat.currentDriver ?? heat.driverIds[0],
  };
}

export function finishHeat(heat: Heat): Heat {
  return {
    ...heat,
    status: "finished",
    completedRuns: Math.max(heat.completedRuns, heat.driverIds.length),
  };
}

export function nextHeat(allHeats: Heat[] = heats, currentHeatId?: string) {
  const currentHeat = currentHeatId
    ? allHeats.find((heat) => heat.id === currentHeatId)
    : getCurrentHeat(allHeats);

  if (!currentHeat) {
    return allHeats.find((heat) => heat.status === "ready") ?? allHeats[0];
  }

  return [...allHeats]
    .sort((a, b) => a.heatNumber - b.heatNumber)
    .find((heat) => heat.heatNumber > currentHeat.heatNumber);
}

export function getCurrentHeat(allHeats: Heat[] = heats, currentHeatId?: string) {
  if (currentHeatId) {
    return allHeats.find((heat) => heat.id === currentHeatId);
  }

  return (
    allHeats.find((heat) => heat.status === "active") ??
    allHeats.find((heat) => heat.status === "ready")
  );
}

export function getNextHeat(allHeats: Heat[] = heats, currentHeatId?: string) {
  const currentHeat = getCurrentHeat(allHeats, currentHeatId);
  return nextHeat(allHeats, currentHeat?.id);
}

export function getHeatResults(
  heatId: string,
  results: ResultScore[] = resultScores
) {
  return results.filter((result) => result.heatId === heatId);
}

export function getDriversInHeat(heat: Heat, driverList: Driver[] = drivers) {
  return heat.driverIds
    .map((driverId) => driverList.find((driver) => driver.id === driverId))
    .filter((driver): driver is Driver => Boolean(driver));
}

export function getHeatStatus(heat: Heat) {
  return heat.status;
}

export function getHeatProgress(heat: Heat) {
  const totalRuns = heat.driverIds.length;
  const completedRuns = Math.min(heat.completedRuns, totalRuns);

  return {
    totalRuns,
    completedRuns,
    remainingRuns: Math.max(totalRuns - completedRuns, 0),
    percent: totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0,
  };
}

export function getHeatWinner(heatId: string, results: ResultScore[] = resultScores) {
  return getBestScore(getApprovedResults(getHeatResults(heatId, results)));
}
