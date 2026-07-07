"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { hasEventOSAccess } from "@/components/auth/mock-auth";
import { useMockSession } from "@/components/auth/use-mock-session";
import DarkLightPassport from "@/components/player/DarkLightPassport";
import { upcomingEvents } from "@/data/upcoming-events";

const quickLinks = [
  { href: "/events", label: "Se events" },
  { href: "/booking", label: "Book event" },
  { href: "/profile", label: "Profil" },
  { href: "/achievements", label: "Præstationer" },
];

export default function DashboardPage() {
  const session = useMockSession();
  const crewAccess = hasEventOSAccess(session);

  if (!session) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <section className="flex min-h-screen items-center justify-center px-6 py-32">
          <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-zinc-500">Log ind kræves</p>
            <h1 className="mt-4 text-4xl font-black">Åbn dit dashboard</h1>
            <p className="mt-4 text-zinc-400">Log ind med character name, DarkLight ID og PIN for at se dine events, billetter og profil.</p>
            <Link href="/login" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
              Log ind
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">Spiller-dashboard</p>
              <h1 className="text-5xl font-black md:text-7xl">Velkommen, {session.characterName}</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">Dit overblik over DarkLight Events, billetter, profil og næste muligheder i DreamLight.</p>
            </div>
            {crewAccess ? (
              <Link href="/competition/control-center" className="w-fit rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
                Åbn EventOS
              </Link>
            ) : null}
          </div>

          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <DarkLightPassport
              characterName={session.characterName}
              darklightId={session.darklightId}
              role={session.roles.join(" / ")}
              status="Aktiv"
              crewAccess={crewAccess}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Panel title="Næste event" text={`${upcomingEvents[0]?.title || "Event afventer"} · ${upcomingEvents[0]?.location || "Lokation afventer"}`} actionHref="/events" action="Se events" />
              <Panel title="Billetter" text="Aktive billetter vises her, når du er tilmeldt et event." actionHref="/profile" action="Se profil" />
              <Panel title="Garage" text="Dine køretøjer og eventvalg samles i spillerprofilen." actionHref="/profile" action="Åbn garage" />
              <Panel title="Præstationer" text="Clean start: præstationer låses op, når du deltager i rigtige events." actionHref="/achievements" action="Se præstationer" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 font-black transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.07]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Panel({ title, text, actionHref, action }: { title: string; text: string; actionHref: string; action: string }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-400">{text}</p>
      <Link href={actionHref} className="mt-6 inline-flex rounded-full border border-white/10 px-5 py-2.5 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
        {action}
      </Link>
    </article>
  );
}

