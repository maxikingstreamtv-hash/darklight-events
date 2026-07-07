"use client";

import Link from "next/link";

const platformLinks = [
  { href: "/", label: "Forside" },
  { href: "/events", label: "Events" },
  { href: "/leaderboard", label: "Rangliste" },
  { href: "/hall-of-fame", label: "Hall of Fame" },
  { href: "/achievements", label: "Præstationer" },
  { href: "/profile", label: "Profil" },
  { href: "/dashboard", label: "Dashboard" },
];

const infoLinks = [
  { href: "/dokumenter", label: "Dokumenter" },
  { href: "/tilladelser", label: "Tilladelser" },
  { href: "/sponsorer", label: "Sponsorer" },
  { href: "/nyheder", label: "Nyheder" },
  { href: "/galleri", label: "Galleri" },
  { href: "/staff", label: "Staff" },
  { href: "/faq", label: "FAQ" },
  { href: "/regelsaet", label: "Regelsæt" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_0.9fr_0.9fr_1fr]">
          <div>
            <h2 className="text-3xl font-black tracking-[0.3em]">DARKLIGHT</h2>
            <p className="mt-1 text-sm uppercase tracking-[0.35em] text-zinc-500">EVENTS</p>
            <p className="mt-8 max-w-md leading-8 text-zinc-400">
              Premium events i DreamLight: motorsport, shows, private events og store oplevelser i byen.
            </p>
          </div>

          <LinkGroup title="Platform" links={platformLinks} />
          <LinkGroup title="Information" links={infoLinks} />

          <div>
            <h3 className="mb-6 text-lg font-black">DarkLight staff</h3>
            <div className="space-y-5 text-zinc-400">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">Founder / CEO</p>
                <p className="mt-2">Cole Kane</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">Co-Founder</p>
                <p className="mt-2">Izadora Solis</p>
              </div>
              <Link href="/booking" className="inline-flex w-fit rounded-full bg-white px-6 py-3 font-black text-black shadow-[0_14px_35px_rgba(255,255,255,0.10)] transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300">
                Book event
              </Link>
            </div>
          </div>
        </div>

        <div className="my-14 h-px bg-white/10" />

        <div className="flex flex-col items-center justify-between gap-5 text-center text-sm text-zinc-500 md:flex-row">
          <p>{new Date().getFullYear()} DarkLight Events.</p>
          <p>Eventorganisation i DreamLight FiveM Roleplay.</p>
        </div>
      </div>
    </footer>
  );
}

function LinkGroup({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h3 className="mb-6 text-lg font-black">{title}</h3>
      <div className="flex flex-col gap-4">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="w-fit whitespace-nowrap text-zinc-400 transition duration-300 hover:translate-x-1 hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

