import type { ReactNode } from "react";
import CompetitionLayout from "@/components/competition/CompetitionLayout";

export default function ControlCenterLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <CompetitionLayout>{children}</CompetitionLayout>;
}
