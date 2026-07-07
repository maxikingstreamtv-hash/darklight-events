import type { ReactNode } from "react";
import CompetitionSidebar from "@/components/competition/CompetitionSidebar";

export default function CompetitionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black pt-24 text-white lg:pt-28">
      <div className="flex min-h-[calc(100vh-6rem)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%)] lg:min-h-[calc(100vh-7rem)]">
        <CompetitionSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
