import type { ReactNode } from "react";

export default function CompetitionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="min-w-0">{children}</main>
    </div>
  );
}
