"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getAvailableDrivers } from "@/components/auth/driver-directory";
import { useMockSession } from "@/components/auth/use-mock-session";
import { useEventOSStore, type EventSponsor } from "@/components/competition/eventos-store";
import { getLiveLeaderboardRows } from "@/components/competition/result-engine";
import type { PublicEventRoute } from "@/components/events/event-route-adapter";

const EVENT_SIGNUP_STORAGE_KEY = "darklight-public-event-signups";

function getSignups() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem(EVENT_SIGNUP_STORAGE_KEY) ?? "{}") as Record<string, string[]>;
  } catch {
    return {};
  }
}

function getDriverName(driverId: string) {
  return getAvailableDrivers().find((driver) => driver.id === driverId)?.name ?? "Ukendt kører";
}

function formatResult(entry: ReturnType<typeof getLiveLeaderboardRows>[number]) {
  if (entry.resultType === "time") return `${(entry.finalTime ?? 0).toFixed(3)}s`;
  if (entry.resultType === "placement") return `P${entry.placement ?? "-"}`;
  return `${entry.score ?? 0} point`;
}

export default function EventDetailLive({ event }: { event: PublicEventRoute }) {
  const { participants, results, hallOfFameWinners, eventSponsors } = useEventOSStore();
  const session = useMockSession();
  const [signups, setSignups] = useState<Record<string, string[]>>(getSignups);
  const allDrivers = useMemo(() => getAvailableDrivers(), []);

  const localSignups = signups[event.id] ?? [];
  const isSignedUp = Boolean(session && localSignups.includes(session.darklightId));
  const eventParticipants = participants.filter((participant) => participant.eventId === event.id);
  const participantCount = event.participants + localSignups.length;
  const availableSpots = Math.max(event.maxParticipants - participantCount, 0);
  const eventResults = results.filter((result) => result.eventId === event.id);
  const leaderboard = useMemo(() => getLiveLeaderboardRows(eventResults), [eventResults]);
  const winners = hallOfFameWinners
    .filter((winner) => winner.eventId === event.id)
    .sort((a, b) => a.placement - b.placement);
  const sponsors = eventSponsors.filter((sponsor) => sponsor.eventId === event.id);
  const isFinished = event.status === "Afsluttet" || leaderboard.length > 0 || winners.length > 0;

  function toggleSignup() {
    if (!session) return;

    setSignups((current) => {
      const existing = current[event.id] ?? [];
      const nextEventSignups = existing.includes(session.darklightId)
        ? existing.filter((id) => id !== session.darklightId)
        : [...existing, session.darklightId];
      const next = { ...current, [event.id]: nextEventSignups };
      window.localStorage.setItem(EVENT_SIGNUP_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div id="tilmelding" className="mt-8 grid gap-8">
      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <Panel title="Tilmelding">
          <p className="text-zinc-400">
            {participantCount}/{event.maxParticipants} deltagere tilmeldt. {availableSpots} ledige pladser.
          </p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${Math.min((participantCount / event.maxParticipants) * 100, 100)}%` }} />
          </div>

          {!session ? (
            <div className="mt-7 rounded-2xl border border-white/10 bg-black p-5">
              <p className="font-black">Du skal være logget ind for at tilmelde dig.</p>
              <Link href="/login" className="mt-5 inline-flex rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
                Log ind
              </Link>
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border border-white/10 bg-black p-5">
              <p className="font-black">{isSignedUp ? "Du er nu tilmeldt." : `Logget ind som ${session.characterName}.`}</p>
              <button
                type="button"
                onClick={toggleSignup}
                className="mt-5 rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300"
              >
                {isSignedUp ? "Frameld" : "Tilmeld mig"}
              </button>
            </div>
          )}
        </Panel>

        <Panel title="Kørere">
          <div className="grid gap-3">
            {eventParticipants.length > 0 ? (
              eventParticipants.map((participant) => {
                const driver = allDrivers.find((item) => item.id === participant.driverId);
                return (
                  <div key={participant.id} className="rounded-2xl border border-white/10 bg-black p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.03]">
                    <p className="font-black">{driver?.name ?? "Ukendt kører"}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {driver?.darklightId ?? "DL-00000"} / {participant.checkedIn ? "Checket ind" : "Afventer check-in"}
                    </p>
                  </div>
                );
              })
            ) : (
              <EmptyState text="Den offentlige kørerliste åbner, når staff registrerer deltagere." />
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Galleri">
          {event.gallery.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {event.gallery.map((image) => (
                <div key={image} className="aspect-video rounded-2xl border border-white/10 bg-white/[0.04]" />
              ))}
            </div>
          ) : (
            <EmptyState text="Der er endnu ikke uploadet billeder fra dette event." />
          )}
        </Panel>

        <Panel title="Tilladelser">
          {event.permission ? (
            <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-5">
              <p className="font-black text-green-200">Tilladelse {event.permission.status.toLowerCase()}</p>
              <p className="mt-3 text-sm leading-6 text-green-100/80">
                Dato: {event.permission.date}<br />
                Ansvarlig myndighed: {event.permission.authority}<br />
                Ansøger: {event.permission.applicant}
              </p>
            </div>
          ) : (
            <EmptyState text="Ingen offentlig tilladelse registreret." />
          )}
        </Panel>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Resultater">
          {isFinished && leaderboard.length > 0 ? (
            <div className="grid gap-3">
              {leaderboard.slice(0, 3).map((entry) => (
                <div key={entry.id} className="grid gap-3 rounded-2xl border border-white/10 bg-black p-4 md:grid-cols-[80px_1fr_120px] md:items-center">
                  <p className="text-2xl font-black">#{entry.position}</p>
                  <p className="font-black">{getDriverName(entry.driverId)}</p>
                  <p className="font-black text-zinc-300">{formatResult(entry)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Resultater offentliggøres efter eventet." />
          )}
        </Panel>

        <Panel title="Vindere">
          {winners.length > 0 ? (
            <div className="grid gap-3">
              {winners.map((winner) => (
                <div key={winner.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black p-4">
                  <p className="font-black">#{winner.placement} {getDriverName(winner.driverId)}</p>
                  <p className="text-sm text-zinc-500">{winner.publishedBy}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Vindere vises, når DarkLight staff offentliggør dem." />
          )}
        </Panel>
      </div>

      <Panel title="Sponsorer">
        {sponsors.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="rounded-2xl border border-white/10 bg-black p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.03]">
                <SponsorLogo sponsor={sponsor} />
                <h3 className="mt-4 text-lg font-black">{sponsor.name}</h3>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{sponsor.level}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-500">{sponsor.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Der er endnu ikke tilknyttet sponsorer til dette event." />
        )}
      </Panel>
    </div>
  );
}

function createInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "DL";
}

function SponsorLogo({ sponsor }: { sponsor: Pick<EventSponsor, "name" | "logoInitials" | "logoUrl"> }) {
  const initials = sponsor.logoInitials || createInitials(sponsor.name);

  if (sponsor.logoUrl) {
    return (
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white bg-cover bg-center text-sm font-black text-black"
        style={{ backgroundImage: `url(${sponsor.logoUrl})` }}
        aria-label={`${sponsor.name} logo`}
      />
    );
  }

  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white text-sm font-black text-black">
      {initials}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl">
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-5 text-sm font-bold text-zinc-400">
      {text}
    </div>
  );
}

