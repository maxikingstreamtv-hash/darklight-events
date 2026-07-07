"use client";

import { readRegisteredAccounts, type MockSession, type RegisteredAccount } from "@/components/auth/mock-auth";
import { drivers, type Driver } from "@/data/drivers";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function driverIdFromDarkLightId(darklightId: string) {
  return `driver-${slugify(darklightId)}`;
}

function accountToDriver(account: RegisteredAccount): Driver | null {
  if (account.accountType !== "Kører" && account.accountType !== "Player/Driver") return null;

  return {
    id: driverIdFromDarkLightId(account.darklightId),
    darklightId: account.darklightId,
    name: account.characterName,
    role: "Kører / Deltager",
    favoriteVehicle: "Bil ikke valgt",
    level: 1,
    xp: 0,
    events: 0,
    wins: 0,
    podiums: 0,
  };
}

export function getAvailableDrivers() {
  const registeredDrivers = readRegisteredAccounts().map(accountToDriver).filter((driver): driver is Driver => Boolean(driver));
  const byId = new Map<string, Driver>();

  [...drivers, ...registeredDrivers].forEach((driver) => {
    byId.set(driver.id, driver);
  });

  return [...byId.values()];
}

export function findAvailableDriver(driverId?: string) {
  if (!driverId) return undefined;
  return getAvailableDrivers().find((driver) => driver.id === driverId);
}

export function getSessionDriver(session: MockSession | null) {
  if (!session) return drivers[0]!;

  return (
    getAvailableDrivers().find((driver) => driver.darklightId === session.darklightId) ?? {
      id: driverIdFromDarkLightId(session.darklightId),
      darklightId: session.darklightId,
      name: session.characterName,
      role: session.roles.includes("Kører") || session.roles.includes("Driver") ? "Kører / Deltager" : "Gæst",
      favoriteVehicle: "Bil ikke valgt",
      level: 1,
      xp: 0,
      events: 0,
      wins: 0,
      podiums: 0,
    }
  );
}
