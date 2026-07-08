import { redirect } from "next/navigation";
import { canAccessPath, getDashboardPath } from "@/lib/auth/rbac";
import { getCurrentUser } from "@/lib/auth/session";

function getSafeReturnTo(value?: string | string[]) {
  const returnTo = Array.isArray(value) ? value[0] : value;

  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return null;
  }

  return returnTo;
}

export default async function AuthRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const returnTo = getSafeReturnTo(params.returnTo);

  if (returnTo && canAccessPath(user, returnTo)) {
    redirect(returnTo);
  }

  redirect(getDashboardPath(user.role));
}
