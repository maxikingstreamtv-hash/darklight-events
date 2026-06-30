"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { managedEvents } from "@/data/event-manager";
import { participants } from "@/data/participants";
import { drivers } from "@/data/drivers";
import { competitions } from "@/data/competition";

const tabs = [
  "Dashboard",
  "Events",
  "Deltagere",
  "Turneringer",
  "Dommerpanel",
  "Live TV",
  "Hall-of-fame",
];

export default function EventControlTabs() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
            DarkLight Events
          </p>

          <h1 className="text-4xl font-black md:text-6xl">
            Event Control Center
          </h1>

          <p className="mt-5 max-w-3xl text-zinc-400">
            Én samlet kontrolcentral til events, deltagere, turneringer,
            dommere, live-visning og resultater.
          </p>
        </div>

        <div className="mb-10 flex gap-3 overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-black transition ${
                activeTab === tab
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {activeTab === "Dashboard" && <DashboardTab />}
          {activeTab === "Events" && <EventsTab />}
          {activeTab === "Deltagere" && <ParticipantsTab />}
          {activeTab === "Turneringer" && <CompetitionsTab />}
          {activeTab === "Dommerpanel" && <JudgeTab />}
          {activeTab === "Live TV" && <LiveTvTab />}
          {activeTab === "Hall-of-fame" && <HallTab />}
        </motion.div>
      </div>
    </section>
  );
}

function DashboardTab() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Events" value={managedEvents.length} text="Planlagte events" />
        <StatCard title="Deltagere" value={participants.length} text="Tilmeldte deltagere" />
        <StatCard title="Profiler" value={drivers.length} text="DarkLight ID-profiler" />
        <StatCard title="Discipliner" value={competitions.length} text="Scoreboards og turneringer" />
      </div>

      <Panel title="Hurtig adgang">
        <div className="grid gap-4 md:grid-cols-3">
          <QuickLink href="/competition/events" title="Event Manager" text="Åbn eventoversigten" />
          <QuickLink href="/competition/drivers" title="Deltagere" text="Se DarkLight ID databasen" />
          <QuickLink href="/competition/hall-of-fame" title="Hall-of-fame" text="Se vindere og rekorder" />
        </div>
      </Panel>
    </div>
  );
}

function EventsTab() {
  return (
    <Panel title="Events">
      <div className="mb-6">
        <Link
          href="/competition/events/create"
          className="inline-flex rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300"
        >
          + Opret event
        </Link>
      </div>

      <div className="grid gap-4">
        {managedEvents.map((event) => (
          <Link
            key={event.id}
            href={event.href}
            className="rounded-2xl border border-white/10 bg-black p-5 transition hover:border-white/30"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                  {event.type} · {event.status}
                </p>
                <h3 className="mt-2 text-2xl font-black">{event.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">
                  {event.date} kl. {event.time} · {event.location}
                </p>
              </div>

              <p className="text-xl font-black">
                {event.participants}/{event.maxParticipants}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function ParticipantsTab() {
  return (
    <Panel title="Deltagere">
      <div className="grid gap-4">
        {participants.map((participant) => {
          const driver = drivers.find((driver) => driver.id === participant.driverId);

          if (!driver) return null;

          return (
            <Link
              key={participant.id}
              href={`/competition/drivers/${driver.id}`}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black p-5 transition hover:border-white/30 md:flex-row md:items-center"
            >
              <div>
                <h3 className="text-xl font-black">{driver.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{driver.darklightId}</p>
              </div>

              <span
                className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${
                  participant.checkedIn
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {participant.checkedIn ? "✓ Checket ind" : "Afventer check-in"}
              </span>
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}

function CompetitionsTab() {
  return (
    <Panel title="Turneringer">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {competitions.map((competition) => (
          <Link
            key={competition.id}
            href={competition.href}
            className="rounded-2xl border border-white/10 bg-black p-5 transition hover:-translate-y-1 hover:border-white/30"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="text-3xl">{competition.icon}</span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">
                {competition.status}
              </span>
            </div>

            <h3 className="text-xl font-black">{competition.title}</h3>
            <p className="mt-2 text-sm text-zinc-500">{competition.subtitle}</p>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

function JudgeTab() {
  return (
    <Panel title="Dommerpanel">
      <div className="rounded-2xl border border-white/10 bg-black p-6">
        <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
          Prototype
        </p>
        <h3 className="mt-3 text-3xl font-black">Pointgivning kommer her</h3>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Her bygger vi senere dommerpanel til drift, carshow, Mr. DreamLight,
          Miss DreamLight og andre bedømmelser.
        </p>
      </div>
    </Panel>
  );
}

function LiveTvTab() {
  return (
    <Panel title="Live TV">
      <div className="rounded-2xl border border-white/10 bg-black p-6">
        <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
          Kommer snart
        </p>
        <h3 className="mt-3 text-3xl font-black">Storskærm & OBS-visning</h3>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Her bygger vi live-visning til aktuelle battles, næste heat,
          resultater, logo og eventstatus.
        </p>
      </div>
    </Panel>
  );
}

function HallTab() {
  return (
    <Panel title="Æreshal">
      <div className="grid gap-4 md:grid-cols-2">
        <QuickLink
          href="/competition/hall-of-fame"
          title="Åben Hall of Fame"
          text="Se champions, rekorder og tidligere vindere."
        />

        <QuickLink
          href="/competition"
          title="Sæsoner"
          text="Sæsonsystem bygges senere."
        />
      </div>
    </Panel>
  );
}

function StatCard({
  title,
  value,
  text,
}: {
  title: string;
  value: string | number;
  text: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        {title}
      </p>
      <p className="mt-4 text-4xl font-black">{value}</p>
      <p className="mt-3 text-sm text-zinc-400">{text}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
      <h2 className="mb-8 text-3xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function QuickLink({
  href,
  title,
  text,
}: {
  href: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-black p-5 transition hover:-translate-y-1 hover:border-white/30"
    >
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm text-zinc-500">{text}</p>
    </Link>
  );
}