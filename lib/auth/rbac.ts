import { hasPermission } from "./permissions";
import type { AppRole } from "./types";

type AccessSubject = {
  role: AppRole;
  permissions?: string[];
};

export function getDashboardPath(role: AppRole) {
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return "/admin";
  }

  if (role === "EVENT_MANAGER") {
    return "/competition";
  }

  return "/dashboard";
}

export function canAccessPath(subject: AccessSubject, pathname: string) {
  const permissions = subject.permissions ?? [];

  if (pathname.startsWith("/admin")) {
    return subject.role === "SUPER_ADMIN" || subject.role === "ADMIN";
  }

  if (pathname.startsWith("/competition")) {
    return (
      subject.role === "SUPER_ADMIN" ||
      subject.role === "ADMIN" ||
      subject.role === "EVENT_MANAGER" ||
      hasPermission(subject.role, permissions, "MANAGE_EVENTS")
    );
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
    return true;
  }

  return true;
}
