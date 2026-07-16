export const appRoles = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "USER"] as const;

export type AppRole = (typeof appRoles)[number];

export const permissionKeys = [
  "MANAGE_USERS",
  "MANAGE_BADGES",
  "MANAGE_PERMISSIONS",
  "MANAGE_EVENTS",
  "MANAGE_RESULTS",
  "MANAGE_GALLERY",
  "MANAGE_SETTINGS",
] as const;

export type PermissionKey = (typeof permissionKeys)[number];

export type SessionBadge = {
  id: string;
  name: string;
  label: string;
  color?: string | null;
  icon?: string | null;
};

export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
  role: AppRole;
  active: boolean;
  profileStatus: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  badges: SessionBadge[];
  permissions: string[];
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && appRoles.includes(value as AppRole);
}

export function isActiveProfile(user: {
  active?: boolean | null;
  profileStatus?: string | null;
  archivedAt?: Date | string | null;
  deletedAt?: Date | string | null;
}) {
  return user.active !== false && user.profileStatus === "ACTIVE" && !user.archivedAt && !user.deletedAt;
}
