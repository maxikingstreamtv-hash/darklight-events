import type { ReactNode } from "react";
import Card from "@/components/competition/ui/Card";

export default function StatCard({
  title,
  value,
  text,
  className = "",
}: {
  title: string;
  value: ReactNode;
  text?: ReactNode;
  className?: string;
}) {
  return (
    <Card interactive className={`group ${className}`}>
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-4xl font-black leading-none text-white transition duration-300 group-hover:text-zinc-100">{value}</p>
      {text ? <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p> : null}
    </Card>
  );
}
