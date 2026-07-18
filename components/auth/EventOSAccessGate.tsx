"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { canAccessPath } from "@/lib/auth/rbac";

export default function EventOSAccessGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (pathname === "/competition") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return <GateShell title="Kontrollerer adgang" text="DarkLight validerer din session." />;
  }

  if (!session?.user) {
    return (
      <GateShell
        title="Log ind for at fortsætte"
        text="EventOS er for DarkLight staff. Log ind med din DarkLight konto for adgang til eventværktøjer, resultater og administration."
        actions={<Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">Åbn login</Link>}
      />
    );
  }

  if (!canAccessPath(session.user, pathname)) {
    return (
      <GateShell
        title="Ingen adgang"
        text="Du er logget ind, men din rolle giver ikke adgang til denne EventOS-side."
        actions={<Link href="/forbidden" className="rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">Se adgangsside</Link>}
      />
    );
  }

  return <>{children}</>;
}

function GateShell({ title, text, actions }: { title: string; text: string; actions?: ReactNode }) {
  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-2xl rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">DarkLight EventOS</p>
        <h1 className="mt-4 text-5xl font-black">{title}</h1>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-zinc-400">{text}</p>
        {actions ? <div className="mt-8 flex justify-center">{actions}</div> : null}
      </div>
    </main>
  );
}
