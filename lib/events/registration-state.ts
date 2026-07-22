export const COUNTED_REGISTRATION_STATUSES = ["PENDING", "APPROVED", "CHECKED_IN"] as const;

export type RegistrationReason =
  | "COMPLETED"
  | "CANCELLED"
  | "STARTED"
  | "FULL"
  | "DEADLINE_PASSED"
  | "NOT_STARTED"
  | "OPEN"
  | "NOT_OPEN";

export type RegistrationStateInput = {
  status: string;
  startsAt: Date;
  endsAt?: Date | null;
  registrationOpenAt?: Date | null;
  registrationCloseAt?: Date | null;
  maxParticipants?: number | null;
  registeredParticipants: number;
  userRegistrationStatus?: string | null;
  now?: Date;
};

export type RegistrationState = {
  isOpen: boolean;
  canRegister: boolean;
  reason: RegistrationReason;
  label: string;
  remainingSpots: number | null;
  isFull: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
  isAlreadyRegistered: boolean;
};

export function getEventRegistrationLoginHref(eventId: string) {
  return `/login?returnTo=${encodeURIComponent(`/events/${eventId}`)}`;
}

const labels: Record<RegistrationReason, string> = {
  COMPLETED: "Eventet er afsluttet",
  CANCELLED: "Eventet er aflyst",
  STARTED: "Eventet er startet",
  FULL: "Eventet er fyldt",
  DEADLINE_PASSED: "Tilmeldingen er lukket",
  NOT_STARTED: "Tilmeldingen er ikke åbnet endnu",
  OPEN: "Tilmeldingen er åben",
  NOT_OPEN: "Tilmeldingen er ikke åbnet endnu",
};

export function getRegistrationState(input: RegistrationStateInput): RegistrationState {
  const now = input.now ?? new Date();
  const remainingSpots = input.maxParticipants == null
    ? null
    : Math.max(input.maxParticipants - input.registeredParticipants, 0);
  const isFull = remainingSpots !== null && remainingSpots === 0;
  const hasStarted = input.startsAt <= now;
  const hasEnded = Boolean(input.endsAt && input.endsAt <= now);
  const isAlreadyRegistered = input.userRegistrationStatus === "PENDING"
    || input.userRegistrationStatus === "APPROVED"
    || input.userRegistrationStatus === "CHECKED_IN";

  let reason: RegistrationReason;
  if (input.status === "COMPLETED") reason = "COMPLETED";
  else if (input.status === "CANCELLED") reason = "CANCELLED";
  else if (hasStarted || hasEnded) reason = "STARTED";
  else if (isFull) reason = "FULL";
  else if (input.registrationCloseAt && input.registrationCloseAt < now) reason = "DEADLINE_PASSED";
  else if (input.registrationOpenAt && input.registrationOpenAt > now) reason = "NOT_STARTED";
  else if (input.status === "REGISTRATION_OPEN") reason = "OPEN";
  else reason = "NOT_OPEN";

  const isOpen = reason === "OPEN";
  return {
    isOpen,
    canRegister: isOpen && !isAlreadyRegistered,
    reason,
    label: labels[reason],
    remainingSpots,
    isFull,
    hasStarted,
    hasEnded,
    isAlreadyRegistered,
  };
}
