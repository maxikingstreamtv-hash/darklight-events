"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getPublicEventRoutes, managedEventToPublicRoute, type PublicEventRoute, type PublicEventStatus } from "@/components/events/event-route-adapter";
import { type MockSession } from "@/components/auth/mock-auth";
import { useMockSession } from "@/components/auth/use-mock-session";
import { useEventOSStore } from "@/components/competition/eventos-store";

const EVENT_SIGNUP_STORAGE_KEY = "darklight-public-event-signups";

const filters = [
  "Alle",
  "Biltræf",
  "Drift",
  "Drag Race",
  "Race",
  "Car Show",
  "Bryllup",
  "Firmafest",
  "Festival",
  "Special Event",
];

type SortMode = "date" | "newest" | "oldest" | "popular";

const sortLabels: Record<SortMode, string> = {
  date: "Dato",
  newest: "Nyeste",
  oldest: "Ældste",
  popular: "Mest populære",
};

const staticCalendarEvents = getPublicEventRoutes();

function getSignups() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem(EVENT_SIGNUP_STORAGE_KEY) ?? "{}") as Record<string, string[]>;
  } catch {
    return {};
  }
}

function getDateValue(event: PublicEventRoute) {
  const value = Date.parse(event.date);
  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
}

function statusClasses(status: PublicEventStatus) {
  if (status === "Åben") return "border-green-400/30 bg-green-400/10 text-green-200";
  if (status === "Få pladser") return "border-orange-400/30 bg-orange-400/10 text-orange-200";
  if (status === "Fuld") return "border-red-400/30 bg-red-400/10 text-red-200";
  return "border-zinc-500/30 bg-zinc-500/10 text-zinc-300";
}

function sectionForEvent(event: PublicEventRoute) {
  if (event.status === "Afsluttet") return "past";
  if (event.status === "Åben" || event.status === "Få pladser") return "active";
  return "upcoming";
}

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState("Alle");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const session = useMockSession();
  const { events: managedEvents } = useEventOSStore();
  const [signups, setSignups] = useState<Record<string, string[]>>(getSignups);
  const calendarEvents = useMemo(() => {
    const byId = new Map<string, PublicEventRoute>();
    [...managedEvents.map(managedEventToPublicRoute), ...staticCalendarEvents].forEach((event) => {
      byId.set(event.id, event);
    });
    return [...byId.values()];
  }, [managedEvents]);

  const visibleEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return calendarEvents
      .filter((event) => activeFilter === "Alle" || event.category === activeFilter)
      .filter((event) => {
        if (!query) return true;
        return `${event.title} ${event.description} ${event.location} ${event.category}`.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        if (sortMode === "popular") return b.popularity - a.popularity || b.participants - a.participants;
        if (sortMode === "newest") return getDateValue(b) - getDateValue(a);
        if (sortMode === "oldest") return getDateValue(a) - getDateValue(b);
        return getDateValue(a) - getDateValue(b);
      });
  }, [activeFilter, calendarEvents, search, sortMode]);

  const sections = [
    { id: "active", title: "Aktive events", empty: "Der er ingen aktive events lige nu." },
    { id: "upcoming", title: "Kommende events", empty: "Næste events bliver annonceret her." },
    { id: "past", title: "Tidligere events", empty: "Tidligere events vises her efter afslutning." },
  ] as const;

  function toggleSignup(eventId: string) {
    if (!session) return;

    setSignups((current) => {
      const existing = current[eventId] ?? [];
      const nextEventSignups = existing.includes(session.darklightId)
        ? existing.filter((id) => id !== session.darklightId)
        : [...existing, session.darklightId];
      const next = { ...current, [eventId]: nextEventSignups };
      window.localStorage.setItem(EVENT_SIGNUP_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Events</p>
              <h1 className="text-5xl font-black md:text-7xl">Eventkalender</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">
                Den centrale kalender for events, tilmeldinger og resultater på DreamLight.
              </p>
            </div>
            <Link href="/booking" className="w-fit rounded-full bg-white px-6 py-3 font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.10)] transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300">
              Book DarkLight
            </Link>
          </div>

          <div className="mb-8 grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:grid-cols-[1fr_240px]">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Søgning</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Søg efter event, lokation eller kategori"
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Sortering</span>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
              >
                {(Object.keys(sortLabels) as SortMode[]).map((mode) => (
                  <option key={mode} value={mode}>{sortLabels[mode]}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mb-10 flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-5 py-3 text-sm font-black transition duration-300 ${
                  activeFilter === filter
                    ? "border-white bg-white text-black shadow-[0_12px_35px_rgba(255,255,255,0.10)]"
                    : "border-white/15 bg-white/[0.03] text-zinc-300 hover:-translate-y-0.5 hover:bg-white hover:text-black"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid gap-12">
            {sections.map((section) => {
              const events = visibleEvents.filter((event) => sectionForEvent(event) === section.id);

              return (
                <section key={section.id}>
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="text-3xl font-black">{section.title}</h2>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-zinc-300">
                      {events.length} events
                    </span>
                  </div>
                  {events.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {events.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          session={session}
                          isSignedUp={Boolean(session && signups[event.id]?.includes(session.darklightId))}
                          onToggleSignup={() => toggleSignup(event.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                      <p className="font-black text-zinc-300">{section.empty}</p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function EventCard({
  event,
  session,
  isSignedUp,
  onToggleSignup,
}: {
  event: PublicEventRoute;
  session: MockSession | null;
  isSignedUp: boolean;
  onToggleSignup: () => void;
}) {
  const localSignups = isSignedUp ? 1 : 0;
  const participants = event.participants + localSignups;
  const availableSpots = Math.max(event.maxParticipants - participants, 0);
  const isClosed = event.status === "Afsluttet" || event.status === "Fuld";

  return (
    <article className="group flex h-full min-h-[590px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.06]">
      <div className="relative h-56 bg-white/[0.04]">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover opacity-80 transition duration-700 group-hover:scale-105"
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] backdrop-blur-xl ${statusClasses(event.status)}`}>
            {event.status}
          </span>
          <span className="rounded-full border border-white/15 bg-black/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-200 backdrop-blur-xl">
            {event.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-3xl font-black">{event.title}</h3>
        <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-500">{event.description}</p>

        <div className="mt-5 grid gap-3 text-sm text-zinc-400">
          <Meta label="Dato" value={event.date} />
          <Meta label="Tid" value={event.time} />
          <Meta label="Lokation" value={event.location} />
          <Meta label="Arrangør" value={event.organizer} />
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm font-black text-zinc-300">
            <span>{participants}/{event.maxParticipants} deltagere</span>
            <span>{availableSpots} ledige</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${Math.min((participants / event.maxParticipants) * 100, 100)}%` }} />
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          <Link href={event.href} className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300">
            Se event
          </Link>
          {session ? (
            <button
              type="button"
              disabled={isClosed && !isSignedUp}
              onClick={onToggleSignup}
              className="rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-black text-zinc-200 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSignedUp ? "Frameld" : "Tilmeld"}
            </button>
          ) : (
            <Link href="/login" className="rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-black text-zinc-200 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black">
              Log ind for tilmelding
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black px-4 py-3">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-black text-zinc-200">{value}</span>
    </div>
  );
}

