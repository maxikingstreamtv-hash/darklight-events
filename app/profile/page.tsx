import AppShell from "@/components/layout/AppShell";
import PlayerPortal from "@/components/profile/PlayerPortal";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/session";

type ResultWithParticipant = {
  id: string;
  participantId: string;
  placement: number;
  points: number | null;
  createdAt: Date;
  participant: {
    name: string;
    vehicle: string | null;
  };
  competition: {
    title: string;
    type: string;
    event: {
      title: string;
      startsAt: Date;
    };
  };
};

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: Date | null | undefined) {
  if (!value) return null;

  return new Intl.DateTimeFormat("da-DK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function resultPoints(result: { points: number | null; placement: number }) {
  return result.points ?? Math.max(1000 - result.placement, 0);
}

function buildRanking(results: ResultWithParticipant[], ownNames: Set<string>) {
  const rows = new Map<string, { participantId: string; names: Set<string>; totalPoints: number; bestPlacement: number; latest: Date }>();

  for (const result of results) {
    const existing = rows.get(result.participantId);
    const points = resultPoints(result);

    if (!existing) {
      rows.set(result.participantId, {
        participantId: result.participantId,
        names: new Set([result.participant.name]),
        totalPoints: points,
        bestPlacement: result.placement,
        latest: result.createdAt,
      });
      continue;
    }

    existing.names.add(result.participant.name);
    existing.totalPoints += points;
    existing.bestPlacement = Math.min(existing.bestPlacement, result.placement);
    if (result.createdAt > existing.latest) existing.latest = result.createdAt;
  }

  const ranked = [...rows.values()].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (a.bestPlacement !== b.bestPlacement) return a.bestPlacement - b.bestPlacement;
    return b.latest.getTime() - a.latest.getTime();
  });

  const index = ranked.findIndex((row) => [...row.names].some((name) => ownNames.has(name.toLowerCase())));
  return index >= 0 ? index + 1 : null;
}

export default async function DriverPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string | string[]; error?: string | string[] }>;
}) {
  const sessionUser = await requireCurrentUser();
  const query = await searchParams;
  const ok = readParam(query.ok);
  const error = readParam(query.error);

  const [profile, vehicles, allBadges, allResults, hallOfFame] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        username: true,
        displayName: true,
        darklightId: true,
        avatar: true,
        bio: true,
        role: true,
        active: true,
        profileStatus: true,
        createdAt: true,
        lastLoginAt: true,
        badges: {
          include: {
            badge: true,
          },
        },
      },
    }),
    prisma.vehicle.findMany({
      where: { ownerId: sessionUser.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        displayName: true,
        licensePlate: true,
        vehicleClass: true,
        eventCategory: true,
        imageUrl: true,
        status: true,
        inspections: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            title: true,
            status: true,
            inspectedAt: true,
            createdAt: true,
            items: {
              orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
              select: {
                id: true,
                category: true,
                label: true,
                description: true,
                result: true,
                required: true,
                sortOrder: true,
              },
            },
          },
        },
      },
    }),
    prisma.badge.findMany({ orderBy: [{ label: "asc" }] }),
    prisma.result.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        participant: {
          select: {
            name: true,
            vehicle: true,
          },
        },
        competition: {
          select: {
            title: true,
            type: true,
            event: {
              select: {
                title: true,
                startsAt: true,
              },
            },
          },
        },
      },
    }),
    prisma.hallOfFame.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        winner: true,
        year: true,
        imageUrl: true,
        notes: true,
      },
    }),
  ]);

  if (!profile) {
    throw new Error("Profilen blev ikke fundet.");
  }

  const ownNames = new Set(
    [profile.displayName, profile.username, profile.darklightId].filter(Boolean).map((value) => String(value).toLowerCase()),
  );
  const userResults = allResults.filter((result) => ownNames.has(result.participant.name.toLowerCase()));
  const earnedBadgeIds = new Set(profile.badges.map((item) => item.badgeId));
  const badgeCards = allBadges.map((badge) => ({
    id: badge.id,
    name: badge.name,
    label: badge.label,
    description: badge.description,
    color: badge.color,
    icon: badge.icon,
    earned: earnedBadgeIds.has(badge.id),
  }));
  const userHallOfFame = hallOfFame.filter((entry) => ownNames.has(entry.winner.toLowerCase()));

  const stats = {
    eventsParticipated: new Set(userResults.map((result) => result.competition.event.title)).size,
    wins: userResults.filter((result) => result.placement === 1).length,
    podiums: userResults.filter((result) => result.placement <= 3).length,
    approvedVehicles: vehicles.filter((vehicle) => vehicle.status === "ACTIVE").length,
    currentRanking: buildRanking(allResults, ownNames),
    hallOfFameEntries: userHallOfFame.length,
    badgesEarned: earnedBadgeIds.size,
  };

  return (
    <AppShell wide>
      <PlayerPortal
        profile={{
          displayName: profile.displayName,
          username: profile.username,
          darklightId: profile.darklightId,
          role: profile.role,
          bio: profile.bio,
          avatar: profile.avatar,
          active: profile.active,
          profileStatus: profile.profileStatus,
          memberSince: formatDate(profile.createdAt) ?? "Ukendt",
          lastLoginAt: formatDate(profile.lastLoginAt),
        }}
        stats={stats}
        badges={badgeCards}
        vehicles={vehicles.map((vehicle) => {
          const latest = vehicle.inspections[0];
          return {
            id: vehicle.id,
            displayName: vehicle.displayName,
            licensePlate: vehicle.licensePlate,
            vehicleClass: vehicle.vehicleClass,
            eventCategory: vehicle.eventCategory,
            imageUrl: vehicle.imageUrl,
            status: vehicle.status,
            latestInspection: latest ? {
              title: latest.title,
              status: latest.status,
              inspectedAt: formatDate(latest.inspectedAt),
              createdAt: formatDate(latest.createdAt) ?? "Ukendt",
              items: latest.items.map((item) => ({
                id: item.id,
                category: item.category,
                label: item.label,
                description: item.description,
                result: item.result,
                required: item.required,
                sortOrder: item.sortOrder,
              })),
            } : null,
          };
        })}
        eventHistory={userResults.map((result) => ({
          id: result.id,
          event: result.competition.event.title,
          competition: result.competition.title,
          category: result.competition.type,
          placement: result.placement,
          points: resultPoints(result),
          date: formatDate(result.competition.event.startsAt) ?? formatDate(result.createdAt) ?? "Ukendt",
        }))}
        hallOfFame={userHallOfFame.map((entry) => ({
          id: entry.id,
          title: entry.title,
          notes: entry.notes,
          year: entry.year,
          imageUrl: entry.imageUrl,
        }))}
        settingsSlot={<ProfileEditForm initialBio={profile.bio ?? ""} initialAvatar={profile.avatar ?? ""} displayName={profile.displayName} />}
        messageSlot={<>{ok ? <Message tone="ok" text={ok} /> : null}{error ? <Message tone="error" text={error} /> : null}</>}
      />
    </AppShell>
  );
}

function Message({ tone, text }: { tone: "ok" | "error"; text: string }) {
  return <div className={`rounded-2xl border px-5 py-4 text-sm ${tone === "ok" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-red-400/20 bg-red-400/10 text-red-200"}`}>{text}</div>;
}
