export function AdminCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl ${className}`}>{children}</div>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "strong" | "warn" }) {
  const classes = {
    neutral: "border-white/10 bg-black text-zinc-300",
    strong: "border-white bg-white text-black",
    warn: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  };

  return <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] ${classes[tone]}`}>{children}</span>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

export const fieldClassName = "field";
