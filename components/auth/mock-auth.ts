export type MockRole =
  | "Founder"
  | "Co-Founder"
  | "DarkLight Events Admin"
  | "Event Manager"
  | "Judge"
  | "Check-in Staff"
  | "Driver"
  | "Customer"
  | "Kører"
  | "Kunde";

export type MockSession = {
  characterName: string;
  darklightId: string;
  roles: MockRole[];
  remembered: boolean;
};

export const MOCK_AUTH_STORAGE_KEY = "darklight-events-rp-login";
export const MOCK_AUTH_SESSION_KEY = "darklight-events-rp-session";
export const REGISTER_STORAGE_KEY = "darklight-events-rp-accounts";
export const MOCK_AUTH_CHANGE_EVENT = "darklight-auth-change";

export type RegisteredAccount = {
  characterName: string;
  darklightId: string;
  rpPin: string;
  accountType: "Kører" | "Kunde" | "Player/Driver" | "Customer";
};

export type StaffAccount = {
  characterName: string;
  darklightId: string;
  rpPin: string;
  rpRole: string;
  description: string;
  roles: MockRole[];
  permissions: string[];
};

export const staffAccounts: StaffAccount[] = [
  {
    characterName: "Cole Kane",
    darklightId: "DL-00001",
    rpPin: "1337",
    rpRole: "Founder / CEO",
    description: "DarkLight Events staff i RP. Ikke FiveM-serverejer.",
    roles: ["Founder", "DarkLight Events Admin", "Event Manager", "Judge"],
    permissions: [
      "Fuld EventOS-adgang",
      "Opret events",
      "Indtast point",
      "Indtast tider",
      "Godkend/afvis resultater",
      "Offentliggør vindere",
      "Administrer kørere",
    ],
  },
  {
    characterName: "Izadora Solis",
    darklightId: "DL-00002",
    rpPin: "2468",
    rpRole: "Co-Founder",
    description: "DarkLight Events staff i RP. Ikke FiveM-serverejer.",
    roles: ["Co-Founder", "DarkLight Events Admin", "Event Manager", "Judge"],
    permissions: [
      "Fuld EventOS-adgang",
      "Opret events",
      "Indtast point",
      "Indtast tider",
      "Godkend/afvis resultater",
      "Offentliggør vindere",
      "Administrer kørere",
    ],
  },
];

export const founderAccount = staffAccounts[0]!;

export const coFounderAccount = staffAccounts[1]!;

export const staffAccessRoles: MockRole[] = [
  "Founder",
  "Co-Founder",
  "DarkLight Events Admin",
  "Event Manager",
  "Judge",
];

export function findStaffAccount(characterName: string, darklightId: string, rpPin: string) {
  return staffAccounts.find(
    (account: StaffAccount) =>
      characterName.trim().toLowerCase() === account.characterName.toLowerCase() &&
      darklightId.trim().toUpperCase() === account.darklightId &&
      rpPin.trim() === account.rpPin
  );
}

export function isFounderLogin(characterName: string, darklightId: string, rpPin: string) {
  return !!findStaffAccount(characterName, darklightId, rpPin);
}

export function readRegisteredAccounts() {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(REGISTER_STORAGE_KEY) ?? "[]") as RegisteredAccount[];
  } catch {
    return [];
  }
}

export function findRegisteredAccount(characterName: string, darklightId: string, rpPin: string) {
  return readRegisteredAccounts().find(
    (account: RegisteredAccount) =>
      account.characterName.trim().toLowerCase() === characterName.trim().toLowerCase() &&
      account.darklightId.trim().toUpperCase() === darklightId.trim().toUpperCase() &&
      account.rpPin === rpPin
  );
}

export function createSessionFromRegisteredAccount(account: RegisteredAccount, remember: boolean): MockSession {
  const isDriver = account.accountType === "Kører" || account.accountType === "Player/Driver";

  return {
    characterName: account.characterName,
    darklightId: account.darklightId,
    roles: isDriver ? ["Kører"] : ["Kunde"],
    remembered: remember,
  };
}

export function isFounderSession(session: MockSession | null) {
  return hasEventOSAccess(session);
}

export function hasEventOSAccess(session: MockSession | null) {
  return (
    !!session &&
    session.roles.some((role: MockRole) => staffAccessRoles.includes(role))
  );
}

export function readMockSession() {
  if (typeof window === "undefined") return null;

  const stored =
    window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY) ||
    window.sessionStorage.getItem(MOCK_AUTH_SESSION_KEY);

  if (!stored) return null;

  try {
    return JSON.parse(stored) as MockSession;
  } catch {
    return null;
  }
}

export function getMockSessionSnapshot() {
  if (typeof window === "undefined") return "";

  return (
    window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY) ||
    window.sessionStorage.getItem(MOCK_AUTH_SESSION_KEY) ||
    ""
  );
}

export function subscribeMockSession(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener(MOCK_AUTH_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(MOCK_AUTH_CHANGE_EVENT, callback);
  };
}

function emitMockAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MOCK_AUTH_CHANGE_EVENT));
}

export function saveMockSession(session: MockSession, remember: boolean) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({ ...session, remembered: remember });

  window.sessionStorage.removeItem(MOCK_AUTH_SESSION_KEY);
  window.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);

  if (remember) {
    window.localStorage.setItem(MOCK_AUTH_STORAGE_KEY, payload);
  } else {
    window.sessionStorage.setItem(MOCK_AUTH_SESSION_KEY, payload);
  }

  emitMockAuthChange();
}

export function clearMockSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(MOCK_AUTH_SESSION_KEY);
  emitMockAuthChange();
}
