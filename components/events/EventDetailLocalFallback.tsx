"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useEventOSStore } from "@/components/competition/eventos-store";
import EventDetailLive from "@/components/events/EventDetailLive";
import { managedEventToPublicRoute, slugifyEvent, type PublicEventRoute, type PublicEventStatus } from "@/components/events/event-route-adapter";

function getHrefSegment(value?: string) {
  if (!value) return "";
  return value.split("/").filter(Boolean).at(-1) ?? "";
}

function matchesEvent(event: PublicEventRoute, id: string) {
  const decodedId = decodeURIComponent(id);
  const candidates = new Set([
    id,
    decodedId,
    getHrefSegment(decodedId),
    slugifyEvent(id),
    slugifyEvent(decodedId),
    slugifyEvent(getHrefSegment(decodedId)),
  ]);

  return event.aliases.some((alias) => candidates.has(alias) || candidates.has(slugifyEvent(alias)));
}

function statusClasses(status: PublicEventStatus) {
  if (String(status).includes("ben")) return "border-green-400/30 bg-green-400/10 text-green-200";
  if (String(status).includes("pladser")) return "border-orange-400/30 bg-orange-400/10 text-orange-200";
  if (status === "Fuld") return "border-red-400/30 bg-red-400/10 text-red-200";
  return "border-zinc-500/30 bg-zinc-500/10 text-zinc-300";
}

export default function EventDetailLocalFallback({ id }: { id: string }) {
  const { events } = useEventOSStore();
  const event = useMemo(
    () => events.map(managedEventToPublicRoute).find((item) => matchesEvent(item, id)),
    [events, id]
  );

  if (!event) {
    return (
      <section className="relative flex min-h-[70vh] items-center justify-center px-6 py-32 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_42%)]" />
        <div className="relative mx-auto max-w-2xl rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">DarkLight Events</p>
          <h1 className="mt-4 text-4xl font-black">Event ikke fundet</h1>
          <p className="mt-4 text-zinc-500">Eventet findes ikke i den offentlige kalender eller i lokale EventOS-data.</p>
          <Link href="/events" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-black text-black transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300">
            Tilbage til events
          </Link>
        </div>
      </section>
    );
  }

  return <EventDetailView event={event} />;
}

export function EventDetailView({ event }: { event: PublicEventRoute }) {
  const availableSpots = Math.max(event.maxParticipants - event.participants, 0);

  return (
    <section className="relative overflow-hidden px-6 py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
          <div>
            <div className="mb-5 flex flex-wrap gap-3">
              <span className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${statusClasses(event.status)}`}>
                {event.status}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-300">
                {event.category}
              </span>
            </div>
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Event</p>
            <h1 className="text-5xl font-black md:text-7xl">{event.title}</h1>
            <p className="mt-5 max-w-3xl text-zinc-400">{event.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/events" className="rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 font-black text-zinc-200 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black">
                Alle events
              </Link>
              <Link href="/booking" className="rounded-full bg-white px-6 py-3 font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.10)] transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300">
                Book event
              </Link>
            </div>
          </div>
          <div className="group relative h-80 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.4)] md:h-[460px]">
            <Image src={event.image} alt={event.title} fill className="object-cover opacity-85 transition duration-700 group-hover:scale-105" sizes="(min-width: 1280px) 44vw, 100vw" />
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Dato" value={event.date} />
          <Stat label="Tid" value={event.time} />
          <Stat label="Lokation" value={event.location} />
          <Stat label="Ledige pladser" value={availableSpots} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_420px]">
          <Panel title="Eventinfo">
            <div className="grid gap-3">
              <InfoLine label="Arrangør" value={event.organizer} />
              <InfoLine label="Status" value={event.status} />
              <InfoLine label="Maks deltagere" value={String(event.maxParticipants)} />
              <InfoLine label="Kategori" value={event.category} />
            </div>
          </Panel>

          <Panel title="Regler">
            <List items={event.rules} />
          </Panel>
        </div>

        <div className="mt-8">
          <Panel title="Præmier">
            <List items={event.prizes} />
          </Panel>
        </div>

        <EventDetailLive event={event} />
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl">
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{label}</p>
      <p className="mt-4 text-2xl font-black">{value}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-right font-black text-zinc-200">{value}</p>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item} className="rounded-2xl border border-white/10 bg-black p-4 text-sm text-zinc-300 transition duration-300 hover:border-white/25 hover:bg-white/[0.03]">
          {item}
        </div>
      ))}
    </div>
  );
}

