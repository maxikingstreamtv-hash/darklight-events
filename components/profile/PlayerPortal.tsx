"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  Car,
  Crown,
  Gauge,
  Medal,
  Settings,
  Shield,
  Sparkles,
  Star,
  Trophy,
  UserRound,
} from "lucide-react";

type PortalBadge = {
  id: string;
  name: string;
  label: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  earned: boolean;
};

type PortalVehicle = {
  id: string;
  displayName: string;
  licensePlate: string | null;
  vehicleClass: string | null;
  eventCategory: string | null;
  imageUrl: string | null;
  status: string;
  latestInspection: {
    title: string;
    status: string;
    inspectedAt: string | null;
    createdAt: string;
    items: Array<{
      id: string;
      category: string;
      label: string;
      description: string | null;
      result: string;
      required: boolean;
      sortOrder: number;
    }>;
  } | null;
};

type EventHistoryItem = {
  id: string;
  event: string;
  competition: string;
  category: string;
  placement: number;
  points: number;
  date: string;
};

type HallEntry = {
  id: string;
  title: string;
  notes: string | null;
  year: number;
  imageUrl: string | null;
};

type PortalStats = {
  eventsParticipated: number;
  wins: number;
  podiums: number;
  approvedVehicles: number;
  currentRanking: number | null;
  hallOfFameEntries: number;
  badgesEarned: number;
};

type PlayerPortalProps = {
  profile: {
    displayName: string;
    username: string;
    darklightId: string | null;
    role: string;
    bio: string | null;
    avatar: string | null;
    active: boolean;
    profileStatus: string;
    memberSince: string;
    lastLoginAt: string | null;
  };
  stats: PortalStats;
  badges: PortalBadge[];
  vehicles: PortalVehicle[];
  eventHistory: EventHistoryItem[];
  hallOfFame: HallEntry[];
  settingsSlot: ReactNode;
  messageSlot: ReactNode;
};

const tabs = [
  { id: "overview", label: "Overview", icon: UserRound },
  { id: "garage", label: "Garage", icon: Car },
  { id: "statistics", label: "Statistics", icon: Gauge },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "achievements", label: "Achievements", icon: Award },
  { id: "hall-of-fame", label: "Hall of Fame", icon: Trophy },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type TabId = (typeof tabs)[number]["id"];

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EVENT_MANAGER: "Event Manager",
  USER: "User",
};

export default function PlayerPortal({ profile, stats, badges, vehicles, eventHistory, hallOfFame, settingsSlot, messageSlot }: PlayerPortalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const earnedBadges = badges.filter((badge) => badge.earned);
  const lockedBadges = badges.filter((badge) => !badge.earned);
  const founder = earnedBadges.some((badge) => badge.name.toLowerCase() === "founder" || badge.label.toLowerCase() === "founder");

  return (
    <div className="relative mx-auto w-full max-w-[1700px] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_38%)]" />
      <div className="absolute left-1/2 top-32 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

      <div className="mb-6">
        {messageSlot}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:p-8"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        {founder ? <div className="absolute right-6 top-6 z-20 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">Founder</div> : null}

        <div className="grid gap-8 xl:grid-cols-[minmax(300px,420px)_1fr] xl:items-stretch">
          <ProfileAvatar avatar={profile.avatar} displayName={profile.displayName} active={profile.active} />

          <div className="flex flex-col justify-between gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <BeautifulBadge label={roleLabels[profile.role] ?? profile.role} icon="shield" tone="silver" />
                <BeautifulBadge label={profile.profileStatus} icon="sparkles" tone={profile.active ? "green" : "zinc"} />
              </div>

              <h1 className="mt-6 text-5xl font-black leading-none md:text-7xl">{profile.displayName}</h1>
              <p className="mt-4 text-lg text-zinc-400">@{profile.username}</p>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.24em] text-zinc-500">
                DarkLight ID: {profile.darklightId ?? "Ikke tildelt"}
              </p>

              {profile.bio ? (
                <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">{profile.bio}</p>
              ) : (
                <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-500">Ingen bio endnu. Åbn Settings for at skrive din karakterprofil.</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <InfoTile label="Rolle" value={roleLabels[profile.role] ?? profile.role} />
              <InfoTile label="Medlem siden" value={profile.memberSince} />
              <InfoTile label="Seneste login" value={profile.lastLoginAt ?? "Ikke registreret"} />
            </div>
          </div>
        </div>
      </motion.section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        <StatCard label="Events" value={stats.eventsParticipated} text="deltaget" icon={<CalendarDays />} />
        <StatCard label="Wins" value={stats.wins} text="sejre" icon={<Trophy />} />
        <StatCard label="Podiums" value={stats.podiums} text="top 3" icon={<Medal />} />
        <StatCard label="Vehicles" value={stats.approvedVehicles} text="godkendte" icon={<Car />} />
        <StatCard label="Ranking" value={stats.currentRanking ? `#${stats.currentRanking}` : "-"} text="nuværende" icon={<Gauge />} />
        <StatCard label="Hall of Fame" value={stats.hallOfFameEntries} text="entries" icon={<Crown />} />
        <StatCard label="Badges" value={stats.badgesEarned} text="earned" icon={<BadgeCheck />} />
      </section>

      <div className="mt-8 overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.04] p-2 backdrop-blur-xl">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-[1.35rem] px-4 py-3 text-sm font-black transition ${active ? "text-black" : "text-zinc-400 hover:text-white"}`}
              >
                {active ? <motion.span layoutId="profile-tab" className="absolute inset-0 rounded-[1.35rem] bg-white" /> : null}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === "overview" ? <Overview badges={earnedBadges} vehicles={vehicles} eventHistory={eventHistory} /> : null}
            {activeTab === "garage" ? <Garage vehicles={vehicles} /> : null}
            {activeTab === "statistics" ? <StatisticsPanel stats={stats} eventHistory={eventHistory} /> : null}
            {activeTab === "events" ? <EventTimeline items={eventHistory} /> : null}
            {activeTab === "achievements" ? <Achievements earned={earnedBadges} locked={lockedBadges} /> : null}
            {activeTab === "hall-of-fame" ? <HallOfFamePanel entries={hallOfFame} /> : null}
            {activeTab === "settings" ? <div>{settingsSlot}</div> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProfileAvatar({ avatar, displayName, active }: { avatar: string | null; displayName: string; active: boolean }) {
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-[2.25rem] border border-white/10 bg-neutral-950 shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={`${displayName} avatar`} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle,rgba(255,255,255,0.16),rgba(0,0,0,0.92))] text-8xl font-black">
          {initials}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6">
        <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${active ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" : "bg-zinc-500"}`} />
          {active ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
}

function StatCard({ label, value, text, icon }: { label: string; value: number | string; text: string; icon: ReactNode }) {
  return (
    <motion.article whileHover={{ y: -6 }} className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">{label}</p>
        <span className="text-zinc-400 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      </div>
      <p className="mt-5 text-4xl font-black"><AnimatedValue value={value} /></p>
      <p className="mt-2 text-sm text-zinc-500">{text}</p>
    </motion.article>
  );
}

function AnimatedValue({ value }: { value: number | string }) {
  const numericValue = typeof value === "number" ? value : null;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (numericValue === null) {
      return;
    }

    let frame = 0;
    const totalFrames = 26;
    const id = window.setInterval(() => {
      frame += 1;
      setDisplay(Math.round((numericValue * frame) / totalFrames));
      if (frame >= totalFrames) window.clearInterval(id);
    }, 18);

    return () => window.clearInterval(id);
  }, [numericValue]);

  return <>{numericValue === null ? value : display}</>;
}

function BeautifulBadge({ label, icon, tone = "zinc" }: { label: string; icon?: string | null; tone?: "silver" | "green" | "gold" | "zinc" }) {
  const Icon = icon?.toLowerCase().includes("crown") || label.toLowerCase().includes("founder")
    ? Crown
    : icon?.toLowerCase().includes("trophy") || label.toLowerCase().includes("winner")
      ? Trophy
      : icon?.toLowerCase().includes("star") || label.toLowerCase().includes("vip")
        ? Star
        : icon?.toLowerCase().includes("spark")
          ? Sparkles
          : Shield;
  const tones = {
    silver: "border-white/20 bg-white/10 text-white",
    green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    gold: "border-yellow-300/30 bg-yellow-300/10 text-yellow-100",
    zinc: "border-white/10 bg-black text-zinc-300",
  };

  return (
    <span title={label} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${tones[tone]}`}>
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/70 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-600">{label}</p>
      <p className="mt-2 text-sm font-black text-zinc-200">{value}</p>
    </div>
  );
}

function Overview({ badges, vehicles, eventHistory }: { badges: PortalBadge[]; vehicles: PortalVehicle[]; eventHistory: EventHistoryItem[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <Panel title="Badge showcase">
        {badges.length ? <BadgeGrid badges={badges.slice(0, 8)} /> : <Empty text="Ingen badges er tildelt endnu." />}
      </Panel>
      <Panel title="Seneste aktivitet">
        <div className="grid gap-3">
          {eventHistory.slice(0, 4).map((item) => <TimelineItem key={item.id} item={item} />)}
          {eventHistory.length === 0 ? <Empty text="Ingen eventhistorik endnu." /> : null}
        </div>
      </Panel>
      <Panel title="Mine køretøjer">
        <div className="grid gap-4 md:grid-cols-2">
          {vehicles.slice(0, 2).map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
          {vehicles.length === 0 ? <Empty text="Ingen køretøjer tildelt endnu." /> : null}
        </div>
      </Panel>
    </div>
  );
}

function Garage({ vehicles }: { vehicles: PortalVehicle[] }) {
  const approved = vehicles.filter((vehicle) => vehicle.status === "ACTIVE").length;
  const rejected = vehicles.filter((vehicle) => vehicle.status === "SUSPENDED").length;
  const pending = vehicles.filter((vehicle) => vehicle.latestInspection?.status === "PENDING" || vehicle.latestInspection?.status === "IN_PROGRESS").length;

  return vehicles.length ? (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        <InfoTile label="Godkendte" value={`${approved}`} />
        <InfoTile label="Afventer" value={`${pending}`} />
        <InfoTile label="Afviste" value={`${rejected}`} />
        <InfoTile label="Total" value={`${vehicles.length}`} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
      </div>
    </div>
  ) : <Panel title="Mine køretøjer"><Empty text="Ingen køretøjer tildelt endnu. DarkLight staff administrerer garageprofiler." /></Panel>;
}

function VehicleCard({ vehicle }: { vehicle: PortalVehicle }) {
  const inspection = vehicle.latestInspection;

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
      <div className="relative aspect-[16/9] bg-neutral-950">
        {vehicle.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vehicle.imageUrl} alt={vehicle.displayName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle,rgba(255,255,255,0.14),rgba(0,0,0,0.95))]">
            <Car className="h-16 w-16 text-zinc-600" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-zinc-200">
          {vehicle.status}
        </span>
      </div>
      <div className="p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-2xl font-black">{vehicle.displayName}</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {vehicle.licensePlate ?? "Ingen plade"} / {vehicle.vehicleClass ?? "Ikke angivet"} / {vehicle.eventCategory ?? "Ikke angivet"}
            </p>
          </div>
          <BeautifulBadge label={inspection?.status ?? "Ingen inspektion"} tone={inspection?.status === "APPROVED" ? "green" : "zinc"} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InfoTile label="Køretøjsklasse" value={vehicle.vehicleClass ?? "Ikke angivet"} />
          <InfoTile label="Eventkategori" value={vehicle.eventCategory ?? "Ikke angivet"} />
          <InfoTile label="Last inspection" value={inspection?.inspectedAt ?? inspection?.createdAt ?? "Ingen"} />
          <InfoTile label="Approval" value={vehicle.status === "ACTIVE" ? "Godkendt" : vehicle.status === "SUSPENDED" ? "Afvist" : "Afventer"} />
          <InfoTile label="Checklist" value={inspection ? `${inspection.items.filter((item) => item.result === "APPROVED").length}/${inspection.items.length}` : "Ikke oprettet"} />
        </div>
        <Link
          href={`/profile/vehicles/${vehicle.id}`}
          className="mt-5 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          Se checklist
        </Link>
      </div>
    </article>
  );
}

function StatisticsPanel({ stats, eventHistory }: { stats: PortalStats; eventHistory: EventHistoryItem[] }) {
  const best = eventHistory.slice(0, 5);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel title="Performance snapshot">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoTile label="Win rate" value={stats.eventsParticipated ? `${Math.round((stats.wins / stats.eventsParticipated) * 100)}%` : "0%"} />
          <InfoTile label="Podium rate" value={stats.eventsParticipated ? `${Math.round((stats.podiums / stats.eventsParticipated) * 100)}%` : "0%"} />
          <InfoTile label="Ranking" value={stats.currentRanking ? `#${stats.currentRanking}` : "Ikke placeret"} />
          <InfoTile label="Hall of Fame" value={`${stats.hallOfFameEntries}`} />
        </div>
      </Panel>
      <Panel title="Seneste resultater">
        <div className="grid gap-3">
          {best.map((item) => <TimelineItem key={item.id} item={item} />)}
          {best.length === 0 ? <Empty text="Ingen resultater endnu." /> : null}
        </div>
      </Panel>
    </div>
  );
}

function EventTimeline({ items }: { items: EventHistoryItem[] }) {
  return (
    <Panel title="Event history">
      <div className="relative grid gap-4">
        {items.map((item) => <TimelineItem key={item.id} item={item} />)}
        {items.length === 0 ? <Empty text="Ingen eventhistorik endnu." /> : null}
      </div>
    </Panel>
  );
}

function TimelineItem({ item }: { item: EventHistoryItem }) {
  return (
    <article className="grid gap-4 rounded-2xl border border-white/10 bg-black/70 p-4 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-600">{item.category}</p>
        <h3 className="mt-2 text-xl font-black">{item.event}</h3>
        <p className="mt-1 text-sm text-zinc-500">{item.competition} / {item.date}</p>
      </div>
      <div className="flex gap-3">
        <BeautifulBadge label={`P${item.placement}`} tone={item.placement === 1 ? "gold" : item.placement <= 3 ? "silver" : "zinc"} />
        <BeautifulBadge label={`${item.points} point`} tone="zinc" />
      </div>
    </article>
  );
}

function Achievements({ earned, locked }: { earned: PortalBadge[]; locked: PortalBadge[] }) {
  const all = [...earned, ...locked];

  return (
    <Panel title="Achievements">
      {all.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {all.map((badge) => (
            <article key={badge.id} className={`rounded-[2rem] border p-5 transition ${badge.earned ? "border-white/15 bg-white/[0.055]" : "border-white/5 bg-white/[0.02] opacity-45 grayscale"}`}>
              <BeautifulBadge label={badge.earned ? "Unlocked" : "Locked"} icon={badge.icon} tone={badge.earned ? "silver" : "zinc"} />
              <h3 className="mt-5 text-2xl font-black">{badge.label}</h3>
              <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-500">{badge.description ?? "DarkLight achievement."}</p>
            </article>
          ))}
        </div>
      ) : <Empty text="Ingen achievements er oprettet i databasen endnu." />}
    </Panel>
  );
}

function BadgeGrid({ badges }: { badges: PortalBadge[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {badges.map((badge) => <BeautifulBadge key={badge.id} label={badge.label} icon={badge.icon} tone={badge.color?.toLowerCase().includes("gold") ? "gold" : "silver"} />)}
    </div>
  );
}

function HallOfFamePanel({ entries }: { entries: HallEntry[] }) {
  return (
    <Panel title="Hall of Fame">
      {entries.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <article key={entry.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
              {entry.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.imageUrl} alt={entry.title} className="h-48 w-full object-cover" />
              ) : null}
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-600">{entry.year}</p>
                <h3 className="mt-3 text-2xl font-black">{entry.title}</h3>
                {entry.notes ? <p className="mt-3 text-sm leading-6 text-zinc-500">{entry.notes}</p> : null}
              </div>
            </article>
          ))}
        </div>
      ) : <Empty text="Ingen Hall of Fame entries for denne profil endnu." />}
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <h2 className="mb-5 text-3xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-white/10 bg-black/70 p-5 text-sm text-zinc-500">{text}</p>;
}
