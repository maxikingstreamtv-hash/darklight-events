"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

const primaryLinks = [
  { href: "/events", label: "Events" },
  { href: "/rangliste", label: "Rangliste" },
  { href: "/hall-of-fame", label: "Hall of Fame" },
  { href: "/booking", label: "Booking" },
  { href: "/contact", label: "Kontakt" },
];

const moreLinks = [
  { href: "/profile", label: "Profil" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/achievements", label: "Præstationer" },
  { href: "/dokumenter", label: "Dokumenter" },
  { href: "/tilladelser", label: "Tilladelser" },
  { href: "/sponsorer", label: "Sponsorer" },
  { href: "/nyheder", label: "Nyheder" },
  { href: "/galleri", label: "Galleri" },
  { href: "/staff", label: "Staff" },
  { href: "/faq", label: "FAQ" },
  { href: "/regelsaet", label: "Regelsæt" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isStaff = role === "SUPER_ADMIN" || role === "ADMIN" || role === "EVENT_MANAGER";
  const ctaHref = isStaff ? "/competition/control-center" : session ? "/booking" : "/login";
  const ctaLabel = isStaff ? "Kontrolcenter" : session ? "Book event" : "Log ind";
  const accountLabel = session ? "Konto" : "Log ind / Konto";

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/80 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-5 px-6">
        <Link href="/" className="flex shrink-0 flex-col leading-none transition duration-300 hover:text-zinc-300">
          <span className="whitespace-nowrap text-lg font-black tracking-[0.22em]">DARKLIGHT</span>
          <span className="mt-1 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">Events</span>
        </Link>

        <div className="hidden min-w-0 items-center gap-2 lg:flex">
          {primaryLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}

          <div className="group relative">
            <button type="button" className="whitespace-nowrap rounded-full px-3 py-2 text-sm text-zinc-300 transition duration-300 hover:bg-white/[0.06] hover:text-white">
              Mere
            </button>
            <div className="invisible absolute right-0 top-full z-50 mt-3 w-64 translate-y-2 rounded-2xl border border-white/10 bg-black/95 p-3 opacity-0 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="grid gap-1">
                {moreLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <NavLink href="/login" label={accountLabel} />
        </div>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {isStaff ? (
            <Link
              href="/competition/control-center"
              className="whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-black"
            >
              EventOS
            </Link>
          ) : null}
          <Link
            href={ctaHref}
            className="whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-black text-black shadow-[0_14px_35px_rgba(255,255,255,0.10)] transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300"
          >
            {ctaLabel}
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-full border border-white/10 px-4 py-2 text-2xl text-white transition hover:bg-white hover:text-black lg:hidden"
          aria-label="Åbn menu"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black/95 px-6 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:hidden">
          <div className="grid gap-4 sm:grid-cols-2">
            {[...primaryLinks, ...moreLinks, { href: "/login", label: accountLabel }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="whitespace-nowrap rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-zinc-300 transition hover:bg-white hover:text-black"
              >
                {link.label}
              </Link>
            ))}

            {isStaff ? (
              <Link
                href="/competition/control-center"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/15 px-4 py-3 text-center font-black text-white transition hover:bg-white hover:text-black"
              >
                EventOS
              </Link>
            ) : null}

            <Link
              href={ctaHref}
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-white px-4 py-3 text-center font-black text-black transition hover:bg-zinc-300"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-full px-3 py-2 text-sm text-zinc-300 transition duration-300 hover:bg-white/[0.06] hover:text-white"
    >
      {label}
    </Link>
  );
}

