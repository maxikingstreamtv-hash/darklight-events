"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { isAppRole } from "@/lib/auth/types";
import { canAdminManageTarget, getAssignableRoles, requireAdminUser } from "@/lib/admin/access";
import { writeAuditLog } from "@/lib/admin/audit";
import { isValidId, readUserForm, validateCreateUser, validateUpdateUser } from "@/lib/admin/user-validation";

function redirectWithMessage(path: string, key: "error" | "ok", message: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);
}

export async function createUserAction(formData: FormData) {
  const actor = await requireAdminUser();
  const values = readUserForm(formData);
  const assignableRoles = getAssignableRoles(actor);
  const error = validateCreateUser(values, assignableRoles);

  if (error) {
    redirectWithMessage("/admin/users/create", "error", error);
  }

  const existing = await prisma.user.findUnique({
    where: { username: values.username },
    select: { id: true },
  });

  if (existing) {
    redirectWithMessage("/admin/users/create", "error", "Brugernavnet findes allerede.");
  }

  const user = await prisma.user.create({
    data: {
      username: values.username,
      displayName: values.displayName,
      passwordHash: await hashPassword(values.password),
      role: values.role,
      avatar: values.avatar || null,
      bio: values.bio || null,
    },
    select: {
      id: true,
      username: true,
      role: true,
    },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "user_created",
    target: `user:${user.id}`,
    details: { username: user.username, role: user.role },
  });

  revalidatePath("/admin/users");
  redirect(`/admin/users/${user.id}?ok=${encodeURIComponent("Brugeren blev oprettet.")}`);
}

export async function updateUserAction(userId: string, formData: FormData) {
  const actor = await requireAdminUser();
  const values = readUserForm(formData);
  const assignableRoles = getAssignableRoles(actor);
  const error = validateUpdateUser(values, assignableRoles);
  const pagePath = `/admin/users/${userId}`;

  if (error) {
    redirectWithMessage(pagePath, "error", error);
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, displayName: true, role: true },
  });

  if (!target || !isAppRole(target.role)) {
    redirectWithMessage("/admin/users", "error", "Brugeren blev ikke fundet.");
  }

  if (!canAdminManageTarget(actor, target.role) || !assignableRoles.includes(values.role)) {
    redirectWithMessage(pagePath, "error", "Du kan ikke redigere eller tildele den rolle.");
  }

  const passwordHash = values.password ? await hashPassword(values.password) : undefined;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: values.displayName,
      role: values.role,
      avatar: values.avatar || null,
      bio: values.bio || null,
      ...(passwordHash ? { passwordHash } : {}),
    },
    select: {
      id: true,
      username: true,
      role: true,
    },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "user_updated",
    target: `user:${updated.id}`,
    details: { username: updated.username },
  });

  if (target.role !== updated.role) {
    await writeAuditLog({
      actorId: actor.id,
      action: "role_changed",
      target: `user:${updated.id}`,
      details: { username: updated.username, from: target.role, to: updated.role },
    });
  }

  if (passwordHash) {
    await writeAuditLog({
      actorId: actor.id,
      action: "password_changed",
      target: `user:${updated.id}`,
      details: { username: updated.username },
    });
  }

  revalidatePath("/admin/users");
  revalidatePath(pagePath);
  redirectWithMessage(pagePath, "ok", "Brugeren blev gemt.");
}

export async function grantBadgeAction(userId: string, formData: FormData) {
  const actor = await requireAdminUser();
  const badgeId = formData.get("badgeId");
  const pagePath = `/admin/users/${userId}`;

  if (!isValidId(badgeId)) {
    redirectWithMessage(pagePath, "error", "Vælg et badge først.");
  }

  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId, badgeId } },
    update: {},
    create: { userId, badgeId, grantedBy: actor.id },
  });

  const badge = await prisma.badge.findUnique({ where: { id: badgeId }, select: { name: true, label: true } });

  await writeAuditLog({
    actorId: actor.id,
    action: "badge_granted",
    target: `user:${userId}`,
    details: { badge: badge?.name ?? badgeId },
  });

  revalidatePath(pagePath);
  redirectWithMessage(pagePath, "ok", "Badge blev tildelt.");
}

export async function removeBadgeAction(userId: string, badgeId: string) {
  const actor = await requireAdminUser();
  const pagePath = `/admin/users/${userId}`;
  const badge = await prisma.badge.findUnique({ where: { id: badgeId }, select: { name: true, label: true } });

  await prisma.userBadge.delete({
    where: { userId_badgeId: { userId, badgeId } },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "badge_removed",
    target: `user:${userId}`,
    details: { badge: badge?.name ?? badgeId },
  });

  revalidatePath(pagePath);
  redirectWithMessage(pagePath, "ok", "Badge blev fjernet.");
}

export async function grantPermissionAction(userId: string, formData: FormData) {
  const actor = await requireAdminUser();
  const permissionId = formData.get("permissionId");
  const pagePath = `/admin/users/${userId}`;

  if (!isValidId(permissionId)) {
    redirectWithMessage(pagePath, "error", "Vælg en permission først.");
  }

  await prisma.userPermission.upsert({
    where: { userId_permissionId: { userId, permissionId } },
    update: {},
    create: { userId, permissionId, grantedBy: actor.id },
  });

  const permission = await prisma.permission.findUnique({ where: { id: permissionId }, select: { key: true } });

  await writeAuditLog({
    actorId: actor.id,
    action: "permission_granted",
    target: `user:${userId}`,
    details: { permission: permission?.key ?? permissionId },
  });

  revalidatePath(pagePath);
  redirectWithMessage(pagePath, "ok", "Permission blev tildelt.");
}

export async function removePermissionAction(userId: string, permissionId: string) {
  const actor = await requireAdminUser();
  const pagePath = `/admin/users/${userId}`;
  const permission = await prisma.permission.findUnique({ where: { id: permissionId }, select: { key: true } });

  await prisma.userPermission.delete({
    where: { userId_permissionId: { userId, permissionId } },
  });

  await writeAuditLog({
    actorId: actor.id,
    action: "permission_removed",
    target: `user:${userId}`,
    details: { permission: permission?.key ?? permissionId },
  });

  revalidatePath(pagePath);
  redirectWithMessage(pagePath, "ok", "Permission blev fjernet.");
}
