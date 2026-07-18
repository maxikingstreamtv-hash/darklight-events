import AppSidebar from "@/components/layout/AppSidebar";
import { getCurrentUser } from "@/lib/auth/session";

export default async function GlobalSiteShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-black text-white lg:grid lg:grid-cols-[304px_minmax(0,1fr)]">
      <AppSidebar user={user} />
      <div className="min-w-0 overflow-x-hidden pt-20 lg:pt-0">
        {children}
      </div>
    </div>
  );
}
