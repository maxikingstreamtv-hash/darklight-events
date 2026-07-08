import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth-options";
import { prisma } from "@/lib/prisma";
import { isAppRole, type AuthUser } from "./types";

type UserBadgeRelation = {
  badge: {
    id: string;
    name: string;
    label: string;
    color: string | null;
    icon: string | null;
  };
};

type UserPermissionRelation = {
  permission: {
    key: string;
  };
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      badges: { include: { badge: true } },
      permissions: { include: { permission: true } },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    role: isAppRole(user.role) ? user.role : "USER",
    badges: user.badges.map(({ badge }: UserBadgeRelation) => ({
      id: badge.id,
      name: badge.name,
      label: badge.label,
      color: badge.color,
      icon: badge.icon,
    })),
    permissions: user.permissions.map(({ permission }: UserPermissionRelation) => permission.key),
  };
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
