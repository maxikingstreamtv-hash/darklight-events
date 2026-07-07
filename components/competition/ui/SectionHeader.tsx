import type { ReactNode } from "react";

export default function SectionHeader({
  eyebrow = "DarkLight EventOS",
  title,
  text,
  actions,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  text?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-12 flex flex-col justify-between gap-6 xl:flex-row xl:items-end ${className}`}>
      <div>
        <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">{eyebrow}</p>
        <h1 className="max-w-5xl text-4xl font-black tracking-normal text-white md:text-6xl">{title}</h1>
        {text ? <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">{text}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
