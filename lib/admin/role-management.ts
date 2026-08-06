import type { AppRole, AuthUser } from "@/lib/auth/types";

export function getAssignableRoles(actor: Pick<AuthUser, "role">): AppRole[] {
  if (actor.role === "SUPER_ADMIN") {
    return ["USER", "JUDGE", "EVENT_MANAGER", "ADMIN", "SUPER_ADMIN"];
  }

  if (actor.role === "ADMIN") {
    return ["USER", "JUDGE", "EVENT_MANAGER", "ADMIN"];
  }

  return [];
}

export function canAdminManageTarget(actor: Pick<AuthUser, "role">, targetRole: AppRole) {
  if (actor.role === "SUPER_ADMIN") return true;
  if (actor.role === "ADMIN") return targetRole !== "SUPER_ADMIN";
  return false;
}
