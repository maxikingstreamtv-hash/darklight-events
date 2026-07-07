import { drivers } from "@/data/drivers";
import type { ResultScore } from "@/data/results";
import { resultScores } from "@/data/results";
import type { Season, SeasonPoints, SeasonStanding } from "@/data/seasons";
import { seasonPoints, seasons } from "@/data/seasons";
import { getApprovedResults, getDriverResults, sortResultsForPlacement } from "@/components/competition/result-engine";

function getActiveSeason(seasonId?: string) {
  return (
    seasons.find((season) => season.id === seasonId) ??
    seasons.find((season) => season.status === "active") ??
    seasons[0]
  );
}

function getSeasonResults(season: Season, results: ResultScore[]) {
  return getApprovedResults(results).filter((result) =>
    season.eventIds.includes(result.eventId)
  );
}

function getEventPlacements(results: ResultScore[]) {
  const groupedByEvent = results.reduce<Record<string, ResultScore[]>>(
    (groups, result) => {
      groups[result.eventId] = [...(groups[result.eventId] ?? []), result];
      return groups;
    },
    {}
  );

  return Object.values(groupedByEvent).flatMap((eventResults) =>
    sortResultsForPlacement(eventResults).map((result, index) => ({ result, finish: index + 1 }))
  );
}

export function calculateSeasonPoints(
  score: ResultScore,
  finish = 0,
  points: SeasonPoints = seasonPoints
) {
  if (score.status !== "approved") {
    return 0;
  }

  const placementBonus =
    finish === 1 ? points.win : finish > 1 && finish <= 3 ? points.podium : 0;

  return Math.round(
    points.approvedScore + score.total * points.scoreMultiplier + placementBonus
  );
}

export function getSeasonStandings(
  results: ResultScore[] = resultScores,
  seasonId?: string
): SeasonStanding[] {
  const season = getActiveSeason(seasonId);
  const seasonResults = getSeasonResults(season, results);
  const placements = getEventPlacements(seasonResults);

  return drivers
    .map((driver) => {
      const driverPlacements = placements.filter(
        ({ result }) => result.driverId === driver.id
      );
      const driverResults = driverPlacements.map(({ result }) => result);
      const points = driverPlacements.reduce(
        (sum, placement) =>
          sum + calculateSeasonPoints(placement.result, placement.finish),
        0
      );
      const eventsRun = new Set(driverResults.map((result) => result.eventId)).size;
      const wins = driverPlacements.filter(({ finish }) => finish === 1).length;
      const podiums = driverPlacements.filter(({ finish }) => finish <= 3).length;
      const averageScore =
        driverResults.length > 0
          ? Math.round(
              (driverResults.reduce((sum, result) => sum + result.total, 0) /
                driverResults.length) *
                10
            ) / 10
          : 0;
      const averageFinish =
        driverPlacements.length > 0
          ? Math.round(
              (driverPlacements.reduce((sum, { finish }) => sum + finish, 0) /
                driverPlacements.length) *
                10
            ) / 10
          : 0;

      return {
        seasonId: season.id,
        driverId: driver.id,
        position: 0,
        points,
        eventsRun,
        wins,
        podiums,
        averageScore,
        averageFinish,
      };
    })
    .filter((standing) => standing.eventsRun > 0 || standing.points > 0)
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.wins - a.wins ||
        b.podiums - a.podiums ||
        b.averageScore - a.averageScore
    )
    .map((standing, index) => ({ ...standing, position: index + 1 }));
}

export function getDriverStanding(
  driverId: string,
  results: ResultScore[] = resultScores,
  seasonId?: string
) {
  const standing = getSeasonStandings(results, seasonId).find(
    (entry) => entry.driverId === driverId
  );

  return (
    standing ?? {
      seasonId: getActiveSeason(seasonId).id,
      driverId,
      position: 0,
      points: 0,
      eventsRun: 0,
      wins: 0,
      podiums: 0,
      averageScore: 0,
      averageFinish: 0,
    }
  );
}

export function getTop10(results: ResultScore[] = resultScores, seasonId?: string) {
  return getSeasonStandings(results, seasonId).slice(0, 10);
}

export function getChampionshipLeader(
  results: ResultScore[] = resultScores,
  seasonId?: string
) {
  return getSeasonStandings(results, seasonId)[0];
}

export function getDriverSeasonResults(
  driverId: string,
  results: ResultScore[] = resultScores,
  seasonId?: string
) {
  const season = getActiveSeason(seasonId);

  return getDriverResults(getSeasonResults(season, results), driverId);
}
