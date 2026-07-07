import type { ReactNode } from "react";
import SectionHeader from "@/components/competition/ui/SectionHeader";

export default function CompetitionPageShell({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  maxWidth = "max-w-7xl",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: "max-w-7xl" | "max-w-[1500px]";
}) {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
      <div className={`relative mx-auto ${maxWidth}`}>
        <SectionHeader eyebrow={eyebrow} title={title} text={subtitle} actions={actions} />
        {children}
      </div>
    </section>
  );
}
