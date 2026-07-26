export type ParticipantListItem = {
  id: string;
  status: string;
  createdAt: Date;
  internalNote?: string | null;
  vehicleId?: string | null;
  user: {
    displayName: string;
    username?: string | null;
    darklightId?: string | null;
  };
};

export type ParticipantFilters = {
  query?: string;
  status?: string;
  sort?: "name" | "date" | "status";
  missingVehicle?: boolean;
};

export function filterAndSortParticipants<T extends ParticipantListItem>(items: T[], filters: ParticipantFilters) {
  const query = filters.query?.trim().toLocaleLowerCase("da-DK") ?? "";
  return [...items]
    .filter((item) => {
      if (filters.status && filters.status !== "ALL" && item.status !== filters.status) return false;
      if (filters.missingVehicle && item.vehicleId) return false;
      if (!query) return true;
      return [item.user.displayName, item.user.username, item.user.darklightId, item.internalNote]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("da-DK").includes(query));
    })
    .sort((a, b) => {
      if (filters.sort === "name") return a.user.displayName.localeCompare(b.user.displayName, "da");
      if (filters.sort === "status") return a.status.localeCompare(b.status, "da");
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
}

export function assertMutableHeat(heat: { locked: boolean; status: string }) {
  if (heat.locked || heat.status === "LOCKED" || heat.status === "ACTIVE" || heat.status === "COMPLETED") {
    throw new Error("Kørelisten er låst eller startet.");
  }
}

export function assertBracketWinner(match: { participantAId: string | null; participantBId: string | null }, winnerId: string) {
  if (winnerId !== match.participantAId && winnerId !== match.participantBId) {
    throw new Error("Vinderen skal være deltager i kampen.");
  }
}

export function commandCenterReturnHref(eventId: string, tab: "participants" | "vehicles" | "heats" | "bracket", saved?: string) {
  const hashes = { participants: "deltagere", vehicles: "køretøjer", heats: "køreliste", bracket: "bracket" };
  return `/competition/events/${eventId}?tab=${tab}${saved ? `&saved=${saved}` : ""}#${hashes[tab]}`;
}

export function normalizeInternalNote(value: string) {
  const note = value.trim();
  return note || null;
}
