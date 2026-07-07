import type { ResultScore, ResultStatus } from "@/data/results";

export type LeaderboardEntry = {
  driverId: string;
  position: number;
  total: number;
  bestScore: number;
  bestTime?: number;
  averageScore: number;
  scoreCount: number;
  latestScore?: ResultScore;
};

export type LiveLeaderboardRow = {
  id: string;
  position: number;
  driverId: string;
  eventId: string;
  resultType: "score" | "time" | "placement";
  status: ResultStatus;
  score?: number;
  finalTime?: number;
  placement?: number;
  updatedAt: string;
  result: ResultScore;
};

export type DriverStats = {
  driverId: string;
  eventsParticipated: number;
  wins: number;
  podiums: number;
  top10: number;
  totalPoints: number;
  averageScore: number;
  bestScore: number;
  bestTime?: number;
  dnf: number;
  dns: number;
  disqualifications: number;
  recentResults: ResultScore[];
};

export type EventStats = {
  eventId: string;
  approvedResults: number;
  pendingResults: number;
  rejectedResults: number;
  participants: number;
  averageScore: number;
  fastestTime?: number;
  bestScore: number;
  topThree: LiveLeaderboardRow[];
};

type ScoreParts = Pick<ResultScore, "style" | "speed" | "angle" | "line" | "penalty">;

export function calculateResultScore(score: ScoreParts) {
  return Math.max(score.style + score.speed + score.angle + score.line - score.penalty, 0);
}

export function calculateTotalScore(score: ScoreParts) {
  return calculateResultScore(score);
}

export function calculateFinalTime(rawTime: number, penaltySeconds = 0) {
  return Math.max(rawTime + penaltySeconds, 0);
}

export function isTimeResult(result: ResultScore) {
  return result.resultType === "time";
}

export function isPlacementResult(result: ResultScore) {
  return result.resultType === "placement";
}

export function getResultRankValue(result: ResultScore) {
  if (isTimeResult(result)) return result.finalTime ?? result.time ?? Infinity;
  if (isPlacementResult(result)) return result.placement ?? Infinity;
  return result.total;
}

export function sortResultsForPlacement(results: ResultScore[]) {
  return [...results].sort((a, b) => {
    if (isTimeResult(a) || isTimeResult(b)) {
      return getResultRankValue(a) - getResultRankValue(b);
    }

    if (isPlacementResult(a) || isPlacementResult(b)) {
      return getResultRankValue(a) - getResultRankValue(b);
    }

    return getResultRankValue(b) - getResultRankValue(a);
  });
}

export function updateResultStatus(results: ResultScore[], resultId: string, status: ResultStatus) {
  return results.map((result) => (result.id === resultId ? { ...result, status } : result));
}

export function approveResultScore(results: ResultScore[], resultId: string) {
  return updateResultStatus(results, resultId, "approved");
}

export function rejectResultScore(results: ResultScore[], resultId: string) {
  return updateResultStatus(results, resultId, "rejected");
}

export function getApprovedResults(results: ResultScore[]) {
  return results.filter((result) => result.status === "approved");
}

export function getPendingResults(results: ResultScore[]) {
  return results.filter((result) => result.status === "pending");
}

export function getRejectedResults(results: ResultScore[]) {
  return results.filter((result) => result.status === "rejected");
}

export function getDriverResults(results: ResultScore[], driverId: string) {
  return results.filter((result) => result.driverId === driverId);
}

export function getEventResults(results: ResultScore[], eventId: string) {
  return results.filter((result) => result.eventId === eventId);
}

export function getAverageScore(results: ResultScore[]) {
  const approvedResults = getApprovedResults(results);
  const scoreResults = approvedResults.filter((result) => !isTimeResult(result));

  if (scoreResults.length === 0) return 0;

  const total = scoreResults.reduce((sum, result) => sum + result.total, 0);
  return Math.round((total / scoreResults.length) * 10) / 10;
}

export function getBestScore(results: ResultScore[]) {
  const scoreResults = getApprovedResults(results).filter((result) => !isTimeResult(result));

  return scoreResults.reduce<ResultScore | undefined>(
    (bestScore, result) => (!bestScore || result.total > bestScore.total ? result : bestScore),
    undefined
  );
}

export function getBestTime(results: ResultScore[]) {
  const timeResults = getApprovedResults(results).filter(isTimeResult);

  return timeResults.reduce<ResultScore | undefined>(
    (bestTime, result) => (!bestTime || getResultRankValue(result) < getResultRankValue(bestTime) ? result : bestTime),
    undefined
  );
}

function getEventFinishes(results: ResultScore[]) {
  const groupedByEvent = getApprovedResults(results).reduce<Record<string, ResultScore[]>>((groups, result) => {
    groups[result.eventId] = [...(groups[result.eventId] ?? []), result];
    return groups;
  }, {});

  return Object.values(groupedByEvent).flatMap((eventResults) =>
    sortResultsForPlacement(eventResults).map((result, index) => ({ result, finish: index + 1 }))
  );
}

export function getLeaderboard(results: ResultScore[]): LeaderboardEntry[] {
  const finishes = getEventFinishes(results);
  const groupedResults = getApprovedResults(results).reduce<Record<string, ResultScore[]>>((groups, result) => {
    groups[result.driverId] = [...(groups[result.driverId] ?? []), result];
    return groups;
  }, {});

  return Object.entries(groupedResults)
    .map(([driverId, driverResults]) => {
      const driverFinishes = finishes.filter(({ result }) => result.driverId === driverId);
      const total = driverResults.reduce((sum, result) => sum + result.total, 0);
      const scoreResults = driverResults.filter((result) => !isTimeResult(result));
      const timeResults = driverResults.filter(isTimeResult);
      const bestScore = scoreResults.length > 0 ? Math.max(...scoreResults.map((result) => result.total)) : 0;
      const bestTime =
        timeResults.length > 0
          ? Math.min(...timeResults.map((result) => result.finalTime ?? result.time ?? Infinity))
          : undefined;
      const averageScore = getAverageScore(driverResults);
      const latestScore = [...driverResults].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      const wins = driverFinishes.filter(({ finish }) => finish === 1).length;
      const podiums = driverFinishes.filter(({ finish }) => finish <= 3).length;

      return {
        driverId,
        position: 0,
        total,
        bestScore,
        bestTime,
        averageScore,
        scoreCount: driverResults.length,
        latestScore,
        wins,
        podiums,
      };
    })
    .sort((a, b) => b.total - a.total || b.wins - a.wins || b.podiums - a.podiums || b.bestScore - a.bestScore || (a.bestTime ?? Infinity) - (b.bestTime ?? Infinity))
    .map((entry, index) => ({ ...entry, position: index + 1 }));
}

export function getPodium(results: ResultScore[]) {
  return getLeaderboard(results).slice(0, 3);
}

function getTypeOrder(result: ResultScore) {
  const type = result.resultType ?? "score";
  if (type === "score") return 0;
  if (type === "time") return 1;
  return 2;
}

export function getLiveLeaderboard(results: ResultScore[], eventId?: string): LiveLeaderboardRow[] {
  return getApprovedResults(eventId ? getEventResults(results, eventId) : results)
    .map((result) => ({
      id: result.id,
      position: 0,
      driverId: result.driverId,
      eventId: result.eventId,
      resultType: result.resultType ?? "score",
      status: result.status,
      score: result.resultType === "time" ? undefined : result.total,
      finalTime: result.resultType === "time" ? result.finalTime ?? result.time : undefined,
      placement: result.resultType === "placement" ? result.placement : undefined,
      updatedAt: result.createdAt,
      result,
    }))
    .sort((a, b) => {
      const typeSort = getTypeOrder(a.result) - getTypeOrder(b.result);
      if (typeSort !== 0) return typeSort;
      if (a.resultType === "time" || b.resultType === "time") return (a.finalTime ?? Infinity) - (b.finalTime ?? Infinity);
      if (a.resultType === "placement" || b.resultType === "placement") return (a.placement ?? Infinity) - (b.placement ?? Infinity);
      return (b.score ?? 0) - (a.score ?? 0);
    })
    .map((entry, index) => ({ ...entry, position: index + 1 }));
}

export function getLiveLeaderboardRows(results: ResultScore[]) {
  return getLiveLeaderboard(results);
}

export function getTopThree(results: ResultScore[], eventId?: string) {
  return getLiveLeaderboard(results, eventId).slice(0, 3);
}

export function getDriverStats(results: ResultScore[], driverId: string): DriverStats {
  const approved = getApprovedResults(getDriverResults(results, driverId));
  const finishes = getEventFinishes(results).filter(({ result }) => result.driverId === driverId);
  const scoreResults = approved.filter((result) => !isTimeResult(result));
  const timeResults = approved.filter(isTimeResult);
  const totalPoints = approved.reduce((sum, result) => sum + (result.total ?? 0), 0);
  const recentResults = [...approved].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
  const bestTime = timeResults.reduce<number | undefined>((best, result) => {
    const value = result.finalTime ?? result.time;
    if (typeof value !== "number") return best;
    return typeof best === "number" ? Math.min(best, value) : value;
  }, undefined);

  return {
    driverId,
    eventsParticipated: new Set(approved.map((result) => result.eventId)).size,
    wins: finishes.filter(({ finish }) => finish === 1).length,
    podiums: finishes.filter(({ finish }) => finish <= 3).length,
    top10: finishes.filter(({ finish }) => finish <= 10).length,
    totalPoints,
    averageScore: getAverageScore(approved),
    bestScore: scoreResults.reduce((best, result) => Math.max(best, result.total ?? 0), 0),
    bestTime,
    dnf: approved.filter((result) => result.notes?.toLowerCase().includes("dnf")).length,
    dns: approved.filter((result) => result.notes?.toLowerCase().includes("dns")).length,
    disqualifications: approved.filter((result) => result.notes?.toLowerCase().includes("diskval")).length,
    recentResults,
  };
}

export function getEventStats(results: ResultScore[], eventId: string): EventStats {
  const eventResults = getEventResults(results, eventId);
  const approved = getApprovedResults(eventResults);
  const timeResults = approved.filter(isTimeResult);
  const fastestTime = timeResults.reduce<number | undefined>((best, result) => {
    const value = result.finalTime ?? result.time;
    if (typeof value !== "number") return best;
    return typeof best === "number" ? Math.min(best, value) : value;
  }, undefined);

  return {
    eventId,
    approvedResults: approved.length,
    pendingResults: getPendingResults(eventResults).length,
    rejectedResults: getRejectedResults(eventResults).length,
    participants: new Set(eventResults.map((result) => result.driverId)).size,
    averageScore: getAverageScore(approved),
    fastestTime,
    bestScore: approved.reduce((best, result) => Math.max(best, result.total ?? 0), 0),
    topThree: getTopThree(results, eventId),
  };
}
