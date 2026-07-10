import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";

export function canReadVehicles(user: AuthUser) {
  return user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "EVENT_MANAGER";
}

export function canManageVehicles(user: AuthUser) {
  return user.role === "SUPER_ADMIN" || user.role === "ADMIN";
}

export async function requireVehicleReader() {
  const user = await requireCurrentUser();

  if (!canReadVehicles(user)) {
    redirect("/forbidden");
  }

  return user;
}

export async function requireVehicleManager() {
  const user = await requireCurrentUser();

  if (!canManageVehicles(user)) {
    redirect("/forbidden");
  }

  return user;
}
