import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import type { AppRole } from "@/lib/auth/types";
export { canAdminManageTarget, getAssignableRoles } from "./role-management";

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
