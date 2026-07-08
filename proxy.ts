import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccessPath } from "@/lib/auth/rbac";
import { isAppRole } from "@/lib/auth/types";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  if (!token?.id || !isAppRole(token.role)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const subject = {
    role: token.role,
    permissions: Array.isArray(token.permissions) ? token.permissions : [],
  };

  if (!canAccessPath(subject, pathname)) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/competition/:path*", "/dashboard/:path*", "/profile/:path*"],
};
