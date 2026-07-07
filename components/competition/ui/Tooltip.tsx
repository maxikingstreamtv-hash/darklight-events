import type { ReactNode } from "react";

export default function Tooltip({ text, children, className = "w-fit" }: { text: string; children: ReactNode; className?: string }) {
  return (
    <span className={`group relative inline-flex ${className}`} title={text}>
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 hidden w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-black/95 px-4 py-3 text-left text-xs font-medium leading-5 text-zinc-300 opacity-0 shadow-[0_18px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl transition group-hover:block group-hover:opacity-100 group-focus-within:block group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  );
}
