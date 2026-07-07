"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import Link from "next/link";
import {
  getCurrentHeat,
  getDriversInHeat,
  getHeatProgress,
  getNextHeat,
} from "@/components/competition/heat-engine";
import { useEventOSStore } from "@/components/competition/eventos-store";
import { drivers } from "@/data/drivers";

export default function LiveEventCenterPage() {
  const { activeEventId, events, participants, heats, currentHeatId } = useEventOSStore();
  const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0];
  const currentHeat = getCurrentHeat(heats, currentHeatId);
  const nextHeat = getNextHeat(heats);
  const progress = currentHeat ? getHeatProgress(currentHeat) : undefined;
  const currentDrivers = currentHeat ? getDriversInHeat(currentHeat) : [];
  const finishedDrivers = currentHeat
    ? currentDrivers.slice(0, currentHeat.completedRuns)
    : [];
  const remainingDrivers = currentHeat
    ? currentDrivers.slice(currentHeat.completedRuns)
    : [];
  const eventParticipants = participants.filter(
    (participant) => participant.eventId === activeEvent?.id
  );
  const checkedIn = eventParticipants.filter((p) => p.checkedIn).length;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <CompetitionLayout>
      <section className="relative overflow-hidden px-6 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/competition/control-center"
            className="mb-10 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-300 transition hover:bg-white hover:text-black"
          >
            Tilbage til Kontrolcenter
          </Link>

          <div className="mb-10">
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              DarkLight Events
            </p>

            <h1 className="text-5xl font-black md:text-7xl">
              Livecenter
            </h1>

            <p className="mt-6 max-w-3xl text-zinc-400">
              Styr hele eventet live fra ét professionelt kontrolpanel med
              heat-status, fremdrift, deltagere og eventhandlinger.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Aktuelt heat" value={currentHeat ? `#${currentHeat.heatNumber}` : "-"} />
            <StatCard title="Næste heat" value={nextHeat ? `#${nextHeat.heatNumber}` : "-"} />
            <StatCard title="Kørere klar" value={currentDrivers.length} />
            <StatCard title="Kørere færdige" value={finishedDrivers.length} />
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_420px]">
            <Panel title="Aktivt event">
              <div className="rounded-[2rem] border border-white/10 bg-black p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                  {activeEvent?.type ?? "Event"} · Livekontrol
                </p>

                <h2 className="mt-3 text-4xl font-black">
                  {activeEvent?.title ?? "Intet event valgt"}
                </h2>

                <p className="mt-4 text-zinc-500">
                  {activeEvent?.date} kl. {activeEvent?.time} · {activeEvent?.location}
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-4">
                  <StageCard title="Planlagt" active />
                  <StageCard title="Check-in" active />
                  <StageCard title="Live" active={currentHeat?.status === "active"} />
                  <StageCard title="Afsluttet" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ControlLink text="Åbn check-in" href="/competition/check-in" />
                <ControlLink text="Eventkontrol" href="/competition/control-center" />
                <ControlLink text="Start heat" href="/competition/control-center" />
                <ControlLink text="Afslut event" href="/competition/control-center" danger />
              </div>
            </Panel>

            <Panel title="Heat fremdrift">
              <div className="rounded-[2rem] border border-white/10 bg-black p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                  Resterende kørere
                </p>
                <p className="mt-4 text-6xl font-black">{progress?.remainingRuns ?? 0}</p>

                <div className="mt-7 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-white" style={{ width: `${progress?.percent ?? 0}%` }} />
                </div>

                <p className="mt-4 text-sm text-zinc-500">
                  {progress?.completedRuns ?? 0}/{progress?.totalRuns ?? 0} runs færdige
                </p>
              </div>
            </Panel>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <Panel title="Resterende kørere">
              <div className="grid gap-4">
                {remainingDrivers.map((driver) => (
                  <DriverRow key={driver.id} name={driver.name} meta={driver.darklightId} status="Klar" />
                ))}
                {remainingDrivers.length === 0 ? (
                  <p className="text-zinc-500">Ingen resterende kørere i aktuelt heat.</p>
                ) : null}
              </div>
            </Panel>

            <Panel title="Færdige kørere">
              <div className="grid gap-4">
                {finishedDrivers.map((driver) => (
                  <DriverRow key={driver.id} name={driver.name} meta={driver.darklightId} status="Færdig" />
                ))}
                {finishedDrivers.length === 0 ? (
                  <p className="text-zinc-500">Ingen afsluttede runs endnu.</p>
                ) : null}
              </div>
            </Panel>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <Panel title="Live deltagere">
              <div className="grid gap-4">
                {eventParticipants.map((participant) => {
                  const driver = drivers.find(
                    (driver) => driver.id === participant.driverId
                  );

                  if (!driver) return null;

                  return (
                    <DriverRow
                      key={participant.id}
                      name={driver.name}
                      meta={driver.darklightId}
                      status={participant.checkedIn ? "Klar" : "Afventer"}
                    />
                  );
                })}
              </div>
            </Panel>

            <Panel title="Event beskeder">
              <div className="grid gap-4">
                <MessageCard title="Aktuelt heat" text={currentHeat ? `Heat ${currentHeat.heatNumber} er aktivt.` : "Ingen aktivt heat."} />
                <MessageCard title="Næste heat" text={nextHeat ? `Heat ${nextHeat.heatNumber} står klar.` : "Ingen næste heat."} />
                <MessageCard title="Check-in" text={`${checkedIn}/${eventParticipants.length} deltagere checket ind.`} />
              </div>

              <Link href="/competition/control-center" className="mt-6 inline-flex w-full justify-center rounded-full bg-white px-6 py-4 font-black text-black transition hover:bg-zinc-300">
                Send event besked
              </Link>
            </Panel>
          </div>
        </div>
      </section>

      </CompetitionLayout>
      <Footer />
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-4xl font-black">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function StageCard({ title, active }: { title: string; active?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${active ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-white/10 bg-white/[0.03] text-zinc-500"}`}>
      <p className="text-sm font-black">{title}</p>
    </div>
  );
}

function DriverRow({ name, meta, status }: { name: string; meta: string; status: string }) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black p-5 md:flex-row md:items-center">
      <div>
        <h3 className="text-xl font-black">{name}</h3>
        <p className="mt-1 text-sm text-zinc-500">{meta}</p>
      </div>
      <span className="w-fit rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-300">
        {status}
      </span>
    </div>
  );
}

function ControlLink({ text, href, danger }: { text: string; href: string; danger?: boolean }) {
  return (
    <Link href={href} className={`rounded-full px-5 py-4 text-center font-black transition ${danger ? "border border-red-500/20 text-red-400 hover:bg-red-500/10" : "border border-white/10 text-white hover:bg-white hover:text-black"}`}>
      {text}
    </Link>
  );
}

function MessageCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-5">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm text-zinc-500">{text}</p>
    </div>
  );
}




