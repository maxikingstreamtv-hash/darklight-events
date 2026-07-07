"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { competitions } from "@/data/competition";
import { useEventOSStore } from "@/components/competition/eventos-store";
import Card from "@/components/competition/ui/Card";
import SectionHeader from "@/components/competition/ui/SectionHeader";
import StatCard from "@/components/competition/ui/StatCard";

export default function EventControlTabs() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="DarkLight Events"
          title="Eventkontrol"
          text="Én samlet kontrolcentral til FiveM/RP-events, deltagere, turneringer, dommere, administration og resultater."
        />

        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <DashboardTab />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardTab() {
  const { events, participants } = useEventOSStore();
  const checkedIn = participants.filter((p) => p.checkedIn).length;

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Events" value={events.length} text="Planlagte events" />
        <StatCard title="Deltagere" value={participants.length} text="Tilmeldte deltagere" />
        <StatCard title="Check-in" value={checkedIn} text="Deltagere checket ind" />
        <StatCard title="Turneringer" value={competitions.length} text="Aktive discipliner" />
      </div>

      <Card padded="lg">
        <h2 className="mb-8 text-3xl font-black">Systemstatus</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatusBox title="Eventsystem" status="Online" text="Eventstyring kører normalt." />
          <StatusBox title="Dommerpanel" status="Klar" text="Scoremodul er aktivt." />
          <StatusBox title="Hall of Fame" status="Aktiv" text="Vinderdata kan vises." />
        </div>
      </Card>

      <Card padded="lg">
        <h2 className="mb-8 text-3xl font-black">Hurtig adgang</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <QuickLink href="/competition/control-center/events" title="Eventoversigt" text="Åbn eventoversigten" />
          <QuickLink href="/competition/control-center/drivers" title="Deltagere" text="Se DarkLight ID databasen" />
          <QuickLink href="/competition/control-center/check-in" title="QR Check-in" text="Åbn digital deltager check-in." />
          <QuickLink href="/competition/control-center/live-center" title="Livecenter" text="Styr eventet live fra kontrolcenteret." />
          <QuickLink href="/competition/control-center/hall-of-fame" title="Hall of Fame" text="Se champions, rekorder og tidligere vindere." />
        </div>
      </Card>
    </div>
  );
}

function QuickLink({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-black p-5 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/30"
    >
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
    </Link>
  );
}

function StatusBox({ title, status, text }: { title: string; status: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-5 transition hover:border-white/20">
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-3 text-2xl font-black">{status}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
  );
}
