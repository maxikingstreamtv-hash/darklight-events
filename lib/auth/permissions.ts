import type { AppRole, PermissionKey } from "./types";

export const adminPermissions: PermissionKey[] = [
  "MANAGE_USERS",
  "MANAGE_BADGES",
  "MANAGE_PERMISSIONS",
  "MANAGE_EVENTS",
  "MANAGE_RESULTS",
  "MANAGE_GALLERY",
  "MANAGE_SETTINGS",
];

export function getRolePermissions(role: AppRole): PermissionKey[] {
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return adminPermissions;
  }

  if (role === "EVENT_MANAGER") {
    return ["MANAGE_EVENTS"];
  }

  return [];
}

export function hasPermission(role: AppRole, userPermissions: string[], permission: PermissionKey) {
  return getRolePermissions(role).includes(permission) || userPermissions.includes(permission);
}

export function canManageRolesBadgesAndPermissions(role: AppRole) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canRegisterResults(role: AppRole) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}
