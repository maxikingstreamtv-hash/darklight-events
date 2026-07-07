"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Flame,
  Gauge,
  Handshake,
  Images,
  ListOrdered,
  Medal,
  Newspaper,
  RadioTower,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Badge from "@/components/competition/ui/Badge";
import Card from "@/components/competition/ui/Card";

type SidebarIcon = ComponentType<SVGProps<SVGSVGElement>> | string;

type SidebarLink = {
  href: string;
  label: string;
  icon: SidebarIcon;
};

const links: SidebarLink[] = [
  { href: "/competition/control-center", label: "Eventkontrol", icon: Gauge },
  { href: "/competition/race-control", label: "Løbskontrol", icon: "🎮" },
  { href: "/competition/events", label: "Events", icon: CalendarDays },
  { href: "/competition/drivers", label: "Deltagere", icon: Users },
  { href: "/competition/check-in", label: "QR Check-in", icon: ClipboardCheck },
  { href: "/competition/live-center", label: "Livecenter", icon: RadioTower },
  { href: "/competition/leaderboard", label: "Rangliste", icon: ListOrdered },
  { href: "/competition/results", label: "Resultater", icon: Calculator },
  { href: "/competition/heat-manager", label: "Heat Manager", icon: Flame },
  { href: "/competition/hall-of-fame", label: "Hall of Fame", icon: Medal },
  { href: "/competition/seasons", label: "Sæson", icon: "🏅" },
  { href: "/competition/admin", label: "Administration", icon: Settings },
  { href: "/dokumenter", label: "Dokumenter", icon: FileText },
  { href: "/tilladelser", label: "Tilladelser", icon: ShieldCheck },
  { href: "/sponsorer", label: "Sponsorer", icon: Handshake },
  { href: "/nyheder", label: "Nyheder", icon: Newspaper },
  { href: "/galleri", label: "Galleri", icon: Images },
];

export default function CompetitionSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-28 hidden h-[calc(100vh-7rem)] w-80 shrink-0 overflow-y-auto border-r border-white/10 bg-black/95 p-6 pb-12 text-white shadow-[24px_0_80px_rgba(0,0,0,0.35)] backdrop-blur-xl xl:block">
      <Card padded="sm" className="mb-8">
        <p className="text-xs uppercase tracking-[0.45em] text-zinc-500">DarkLight</p>
        <h2 className="mt-3 text-3xl font-black">Løbskontrol</h2>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">Eventpakke</p>
          <Badge tone="success" className="px-3 py-1 tracking-[0.14em]">Online</Badge>
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black p-4">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
            Manuelle eventdata
          </p>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Data styres manuelt af DarkLight staff.
          </p>
        </div>
      </Card>

      <nav className="grid gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/competition/control-center" && pathname.startsWith(`${link.href}/`));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 font-black transition duration-300 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black ${
                isActive
                  ? "border-white bg-white text-black shadow-[0_18px_50px_rgba(255,255,255,0.14)]"
                  : "border-white/10 bg-white/[0.03] text-zinc-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white hover:text-black"
              }`}
            >
              {typeof Icon === "string" ? (
                <span className="flex h-5 w-5 items-center justify-center text-base" aria-hidden="true">
                  {Icon}
                </span>
              ) : (
                <Icon className="h-5 w-5" aria-hidden="true" />
              )}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <Card padded="sm" className="mt-8">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">System</p>
        <p className="mt-3 text-lg font-black text-green-400">Online</p>
        <p className="mt-2 text-sm leading-6 text-zinc-500">EventOS er klar til manuel eventdrift.</p>
      </Card>
    </aside>
  );
}
