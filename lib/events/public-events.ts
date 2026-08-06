import { getRegistrationState } from "@/lib/events/registration-state";

export const UPCOMING_EVENT_CTA = "Tilmeld event";
export const UPCOMING_EVENT_DETAILS_CTA = "Se event";

export function publicEventHref(id: string) {
  return `/events/${id}`;
}

export function publicEventRegistrationHref(id: string) {
  return `/events/${id}#registration`;
}
export const UPCOMING_EVENTS_EMPTY_TITLE = "Der er ingen kommende events lige nu.";
export const UPCOMING_EVENTS_EMPTY_TEXT = "Hold øje med siden – nye events bliver snart annonceret.";

export type PublicEventVisibilityInput = {
  active: boolean;
  public: boolean;
  status: string;
  startsAt: Date;
  endsAt: Date | null;
};

export function isVisibleUpcomingEvent(event: PublicEventVisibilityInput, now = new Date()) {
  if (!event.active || !event.public) return false;
  if (["CANCELLED", "COMPLETED", "ARCHIVED"].includes(event.status)) return false;
  return event.startsAt >= now || event.endsAt === null || event.endsAt >= now || event.status === "ACTIVE";
}

export function sortUpcomingEvents<T extends { startsAt: Date; title: string }>(events: T[]) {
  return [...events].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime() || a.title.localeCompare(b.title, "da"));
}

export function getPublicPrizeIndicator(event: { usesPrizes: boolean; prizes: Array<{ id: string }> }) {
  if (!event.usesPrizes || event.prizes.length === 0) return null;
  return `${event.prizes.length} ${event.prizes.length === 1 ? "præmie" : "præmier"}`;
}

export async function getPublicUpcomingEvents({ query = "", take }: { query?: string; take?: number } = {}) {
  const { prisma } = await import("@/lib/prisma");
  const now = new Date();
  return prisma.event.findMany({
    where: {
      active: true,
      public: true,
      status: { notIn: ["CANCELLED", "COMPLETED", "ARCHIVED"] },
      OR: [{ startsAt: { gte: now } }, { endsAt: null }, { endsAt: { gte: now } }, { status: "ACTIVE" }],
      ...(query
        ? {
            AND: [{
              OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                { description: { contains: query, mode: "insensitive" as const } },
                { location: { contains: query, mode: "insensitive" as const } },
              ],
            }],
          }
        : {}),
    },
    orderBy: [{ startsAt: "asc" }, { title: "asc" }],
    take,
    select: {
      id: true,
      title: true,
      description: true,
      bannerUrl: true,
      thumbnailUrl: true,
      imageAlt: true,
      imageFocusX: true,
      imageFocusY: true,
      location: true,
      startsAt: true,
      endsAt: true,
      status: true,
      maxParticipants: true,
      registrationOpenAt: true,
      registrationCloseAt: true,
      usesParticipantRegistration: true,
      usesPrizes: true,
      resultMethod: true,
      votingOpenAt: true,
      votingCloseAt: true,
      resultsPublishedAt: true,
      prizes: {
        where: { active: true },
        select: { id: true },
      },
      registrations: {
        where: { status: { in: ["PENDING", "APPROVED", "CHECKED_IN"] } },
        select: { id: true },
      },
    },
  });
}

export type PublicUpcomingEvent = Awaited<ReturnType<typeof getPublicUpcomingEvents>>[number];

export function getPublicEventCardStatus(event: PublicUpcomingEvent, now = new Date()) {
  if (event.startsAt <= now) return "I gang";
  if (!event.usesParticipantRegistration) return "Kommende";
  const state = getRegistrationState({
    ...event,
    registeredParticipants: event.registrations.length,
    now,
  });
  if (state.reason === "FULL") return "Udsolgt";
  if (state.reason === "DEADLINE_PASSED") return "Tilmelding lukket";
  if (state.reason === "OPEN") return "Tilmelding åben";
  return "Kommende";
}
