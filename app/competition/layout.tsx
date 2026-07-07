import type { ReactNode } from "react";
import EventOSAccessGate from "@/components/auth/EventOSAccessGate";

export default function CompetitionRootLayout({ children }: { children: ReactNode }) {
  return <EventOSAccessGate>{children}</EventOSAccessGate>;
}
