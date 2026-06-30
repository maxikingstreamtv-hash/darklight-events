"use client";

import Link from "next/link";

const links = [
  { href: "/", label: "Forside" },
  { href: "/events", label: "Events" },
  { href: "/booking", label: "Booking" },
  { href: "/upcoming", label: "Kommende Events" },
  { href: "/gallery", label: "Galleri" },
  { href: "/team", label: "Team" },
  { href: "/contact", label: "Kontakt" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black text-white">
      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr]">
          
          {/* Brand */}
          <div>
            <h2 className="text-3xl font-black tracking-[0.3em]">
              DARKLIGHT
            </h2>

            <p className="mt-1 text-sm uppercase tracking-[0.35em] text-zinc-500">
              EVENTS
            </p>

            <p className="mt-8 max-w-md leading-8 text-zinc-400">
              DarkLight Events er en RP-virksomhed med fokus på
              eksklusive events, høj kvalitet og oplevelser, der samler
              Dreamlights Borgere.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-6 text-lg font-black">
              Navigation
            </h3>

            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-zinc-400 transition hover:translate-x-1 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="mb-6 text-lg font-black">
              Kontakt
            </h3>

            <div className="space-y-5 text-zinc-400">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">
                  Telefon
                </p>

                <p className="mt-2">
                  Indsættes senere
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">
                  Åbningstider
                </p>

                <p className="mt-2">
                  Man - Fre: 16:00 - 23:00
                </p>

                <p>
                  Lør - Søn: 12:00 - 00:00
                </p>
              </div>

              <Link
                href="/booking"
                className="inline-flex rounded-full bg-white px-6 py-3 font-bold text-black transition hover:scale-105 hover:bg-zinc-300"
              >
                Book Event
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-14 h-px bg-white/10" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-5 text-center text-sm text-zinc-500 md:flex-row">
          <p>
            © {new Date().getFullYear()} DarkLight Events — FiveM Roleplay.
          </p>

          <p>
            Denne hjemmeside er udelukkende udviklet til brug på en FiveM Roleplay-server.
          </p>
        </div>
      </div>
    </footer>
  );
}