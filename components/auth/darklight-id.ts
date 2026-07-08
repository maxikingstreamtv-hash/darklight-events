type DarkLightIdentity = {
  darklightId?: string;
};

export function generateNextDarkLightId(existingAccountsOrDrivers: DarkLightIdentity[]) {
  const highest = existingAccountsOrDrivers.reduce((max: number, account: DarkLightIdentity) => {
    const match = account.darklightId?.match(/DL-(\d+)/i);
    const value = match ? Number(match[1]) : 0;
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);

  return `DL-${String(highest + 1).padStart(5, "0")}`;
}
