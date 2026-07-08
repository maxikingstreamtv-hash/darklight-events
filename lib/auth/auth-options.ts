import type { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "./password";
import { isAppRole, type AppRole, type AuthUser } from "./types";

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

function toAuthUser(user: {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  role: string;
  badges: { badge: { id: string; name: string; label: string; color: string | null; icon: string | null } }[];
  permissions: { permission: { key: string } }[];
}): AuthUser {
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

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "DarkLight login",
      credentials: {
        username: { label: "Brugernavn", type: "text" },
        password: { label: "Adgangskode", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim();
        const password = credentials?.password;

        if (!username || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username },
          include: {
            badges: { include: { badge: true } },
            permissions: { include: { permission: true } },
          },
        });

        if (!user) {
          return null;
        }

        const validPassword = await verifyPassword(password, user.passwordHash);

        if (!validPassword) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return toAuthUser(user) as User;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as User & AuthUser;
        token.id = authUser.id;
        token.username = authUser.username;
        token.displayName = authUser.displayName;
        token.avatar = authUser.avatar;
        token.role = authUser.role;
        token.badges = authUser.badges;
        token.permissions = authUser.permissions;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.username = String(token.username);
        session.user.displayName = String(token.displayName);
        session.user.avatar = typeof token.avatar === "string" ? token.avatar : null;
        session.user.role = (isAppRole(token.role) ? token.role : "USER") as AppRole;
        session.user.badges = Array.isArray(token.badges) ? token.badges : [];
        session.user.permissions = Array.isArray(token.permissions) ? token.permissions : [];
      }

      return session;
    },
  },
};
