export function normalizeTeamSkills(value: string | string[]) {
  const source = Array.isArray(value) ? value : value.split(",");
  const seen = new Set<string>();
  return source.map((item) => item.trim()).filter((item) => {
    const key = item.toLocaleLowerCase("da");
    if (!item || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function visibleTeamMembers<T extends { active: boolean; sortOrder: number; name: string }>(members: T[]) {
  return members.filter((member) => member.active).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "da"));
}
