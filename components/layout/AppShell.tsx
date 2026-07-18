import { requireCurrentUser } from "@/lib/auth/session";

export default async function AppShell({
  children,
  title,
  eyebrow,
  action,
  wide = false,
}: {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  wide?: boolean;
}) {
  await requireCurrentUser();

  return (
    <section className="min-w-0 px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <div className={wide ? "mx-auto w-full max-w-[1720px]" : "mx-auto w-full max-w-7xl"}>
        {title || action || eyebrow ? (
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              {eyebrow ? <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">{eyebrow}</p> : null}
              {title ? <h1 className="text-4xl font-black leading-none md:text-6xl">{title}</h1> : null}
            </div>
            {action}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
