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

export function teamSectionSlug(value: string) {
  return value
    .replace(/æ/gi, "ae")
    .replace(/ø/gi, "oe")
    .replace(/å/gi, "aa")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("da")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "sektion";
}

export function publicTeamSections<
  TMember extends { active: boolean; sortOrder: number; name: string },
  TSection extends { id: string; name: string; description: string | null; isPublic: boolean; sortOrder: number; members: TMember[] },
>(sections: TSection[]) {
  return sections
    .filter((section) => section.isPublic)
    .map((section) => ({ ...section, members: visibleTeamMembers(section.members) }))
    .filter((section) => section.members.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "da"));
}
