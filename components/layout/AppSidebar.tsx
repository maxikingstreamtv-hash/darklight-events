"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  BarChart3,
  CalendarDays,
  Car,
  ChevronRight,
  ClipboardList,
  Contact,
  GalleryHorizontal,
  Gauge,
  HelpCircle,
  Home,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Settings,
  Shield,
  Trophy,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth/types";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles?: AuthUser["role"][];
  superOnly?: boolean;
  authOnly?: boolean;
  guestOnly?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "DarkLight",
    items: [
      { href: "/", label: "Forside", icon: Home },
      { href: "/events", label: "Events", icon: CalendarDays },
      { href: "/upcoming", label: "Kommende events", icon: CalendarDays },
      { href: "/competition", label: "Konkurrencer", icon: Trophy },
      { href: "/rangliste", label: "Rangliste", icon: BarChart3 },
      { href: "/hall-of-fame", label: "Hall of Fame", icon: Trophy },
    ],
  },
  {
    title: "Booking & Info",
    items: [
      { href: "/booking", label: "Booking", icon: ClipboardList },
      { href: "/sponsorer", label: "Sponsorer", icon: Shield },
      { href: "/galleri", label: "Galleri", icon: GalleryHorizontal },
      { href: "/team", label: "Team", icon: Users },
      { href: "/regelsaet", label: "Regelsæt", icon: Shield },
      { href: "/faq", label: "FAQ", icon: HelpCircle },
      { href: "/kontakt", label: "Kontakt", icon: Contact },
    ],
  },
  {
    title: "Konto",
    items: [
      { href: "/login", label: "Log ind", icon: UserRound, guestOnly: true },
      { href: "/register", label: "Opret bruger", icon: UserRound, guestOnly: true },
      { href: "/dashboard", label: "Overblik", icon: LayoutDashboard, authOnly: true },
      { href: "/profile", label: "Min profil", icon: UserRound, authOnly: true },
      { href: "/profile#garage", label: "Mine køretøjer", icon: Car, authOnly: true },
      { href: "/dashboard#events", label: "Mine events", icon: ClipboardList, authOnly: true },
      { href: "/profile#settings", label: "Indstillinger", icon: Settings, authOnly: true },
    ],
  },
  {
    title: "Staff / Admin",
    items: [
      { href: "/competition/control-center", label: "Kontrolcenter", icon: Gauge, roles: ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"] },
      { href: "/competition/admin", label: "EventOS", icon: CalendarDays, roles: ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"] },
      { href: "/admin/vehicles", label: "VehicleOS", icon: Car, roles: ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"] },
      { href: "/admin/users", label: "Brugere", icon: Users, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin", label: "Roller", icon: Lock, roles: ["SUPER_ADMIN", "ADMIN"] },
    ],
  },
  {
    title: "Super Admin",
    items: [
      { href: "/admin", label: "Systemindstillinger", icon: Settings, superOnly: true },
      { href: "/competition/admin", label: "Logs", icon: ClipboardList, superOnly: true },
    ],
  },
];

function visibleGroups(user: AuthUser | null) {
  return navGroups
    .map((group: NavGroup) => ({
      ...group,
      items: group.items.filter((item: NavItem) => {
        if (item.authOnly && !user) return false;
        if (item.guestOnly && user) return false;
        if (item.superOnly) return user?.role === "SUPER_ADMIN";
        if (!item.roles) return true;
        return user?.role === "SUPER_ADMIN" || Boolean(user && item.roles.includes(user.role));
      }),
    }))
    .filter((group: NavGroup) => group.items.length > 0);
}

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppSidebar({ user }: { user: AuthUser | null }) {
  const pathname = usePathname();
  const groups = useMemo(() => visibleGroups(user), [user]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <Brand />
          <button
            type="button"
            aria-label="Åbn navigation"
            onClick={() => setOpen(true)}
            className="rounded-2xl border border-white/10 p-3 text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open ? <button type="button" aria-label="Luk navigation" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setOpen(false)} /> : null}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[304px] max-w-[86vw] border-r border-white/10 bg-black/95 p-4 shadow-[30px_0_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col gap-3 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-between">
            <Brand />
            <button
              type="button"
              aria-label="Luk navigation"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 p-2 text-zinc-300 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <UserPanel user={user} />

          <nav aria-label="DarkLight navigation" className="grid gap-3">
            {groups.map((group: NavGroup) => (
              <div key={group.title} className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-2.5">
                <p className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-zinc-600">{group.title}</p>
                <div className="grid gap-1">
                  {group.items.map((item: NavItem) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={`${group.title}-${item.label}-${item.href}`}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${active ? "bg-white text-black shadow-[0_14px_40px_rgba(255,255,255,0.08)]" : "text-zinc-400 hover:bg-white/10 hover:text-white"}`}
                      >
                        {active ? <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-black lg:bg-white" /> : null}
                        <Icon className="h-4 w-4" />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        <ChevronRight className={`h-4 w-4 transition ${active ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto rounded-[1.35rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),rgba(255,255,255,0.03))] p-4">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white">DarkLight Events</p>
            <p className="mt-2 text-sm text-zinc-400">FiveM RP Server</p>
            <p className="text-sm font-black text-zinc-200">Dreamlight</p>
          </div>
        </div>
      </aside>
    </>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white text-black shadow-[0_14px_40px_rgba(255,255,255,0.08)]">
        <Home className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-sm font-black uppercase tracking-[0.22em] text-white">DarkLight</span>
        <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">Spillerportal</span>
      </span>
    </Link>
  );
}

function UserPanel({ user }: { user: AuthUser | null }) {
  if (!user) {
    return (
      <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Konto</p>
        <p className="mt-2 text-sm text-zinc-400">Log ind for spillerportal, garage og EventOS-adgang.</p>
        <Link href="/login" className="mt-3 flex w-full items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-zinc-300">
          Log ind
        </Link>
      </div>
    );
  }

  const initials = user.displayName.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3">
      <Link href="/profile" className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={user.displayName} className="h-11 w-11 rounded-2xl object-cover" />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-white">{initials}</span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-black text-white">{user.displayName}</span>
          <span className="block truncate text-xs text-zinc-500">{user.role}</span>
        </span>
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <LogOut className="h-4 w-4" />
        Log ud
      </button>
    </div>
  );
}
