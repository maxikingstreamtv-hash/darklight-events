import type { DefaultSession } from "next-auth";
import type { AppRole, SessionBadge } from "@/lib/auth/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      displayName: string;
      avatar?: string | null;
      role: AppRole;
      badges: SessionBadge[];
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    displayName: string;
    avatar?: string | null;
    role: AppRole;
    badges: SessionBadge[];
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    displayName?: string;
    avatar?: string | null;
    role?: AppRole;
    badges?: SessionBadge[];
    permissions?: string[];
  }
}
