import type { ReactNode } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "active";

const tones: Record<BadgeTone, string> = {
  neutral: "border-white/10 bg-white/[0.04] text-zinc-300",
  success: "border-green-500/30 bg-green-500/10 text-green-400",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-400",
  active: "border-white bg-white text-black",
};

export default function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.22em] shadow-[0_12px_35px_rgba(0,0,0,0.25)] transition duration-300 ${tones[tone]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}
