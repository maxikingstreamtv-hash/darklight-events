export type RegistrationPeriodState =
  | "configured"
  | "missing_close"
  | "missing_both"
  | "already_closed"
  | "not_required";

export type RegistrationPeriodInput = {
  usesParticipantRegistration: boolean;
  registrationOpenAt: Date | null;
  registrationCloseAt: Date | null;
};

export function getRegistrationPeriodState(input: RegistrationPeriodInput, now = new Date()): RegistrationPeriodState {
  if (!input.usesParticipantRegistration) return "not_required";
  if (!input.registrationOpenAt && !input.registrationCloseAt) return "missing_both";
  if (!input.registrationCloseAt) return "missing_close";
  if (input.registrationCloseAt <= now) return "already_closed";
  return "configured";
}

export function isRegistrationPeriodConfigured(state: RegistrationPeriodState) {
  return state === "configured" || state === "already_closed" || state === "not_required";
}
