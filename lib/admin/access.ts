import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import type { AppRole, AuthUser } from "@/lib/auth/types";

export async function requireAdminUser() {
  const user = await requireCurrentUser();

  if (!isAdminRole(user.role)) {
    redirect("/forbidden");
  }

  return user;
}

export function isAdminRole(role: AppRole) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function getAssignableRoles(actor: AuthUser): AppRole[] {
  if (actor.role === "SUPER_ADMIN") {
    return ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "USER"];
  }

  return ["ADMIN", "EVENT_MANAGER", "USER"];
}

export function canAdminManageTarget(actor: AuthUser, targetRole: AppRole) {
  if (actor.role === "SUPER_ADMIN") {
    return true;
  }

  return targetRole !== "SUPER_ADMIN";
}
