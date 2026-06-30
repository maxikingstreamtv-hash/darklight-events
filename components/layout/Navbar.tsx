"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/events", label: "Events" },
    { href: "/booking", label: "Booking" },
    { href: "/upcoming", label: "Kommende Events" },
    { href: "/competition", label: "Competition" }, // 🆕 Ny menu
    { href: "/gallery", label: "Galleri" },
    { href: "/team", label: "Team" },
    { href: "/contact", label: "Kontakt" },
  ];

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="DarkLight Events"
            width={260}
            height={260}
            priority
            className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]"
          />

          <div>
            <h1 className="text-xl font-black uppercase tracking-[0.35em]">
              DARKLIGHT
            </h1>

            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
              EVENTS
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-300 transition duration-300 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/booking"
          className="hidden rounded-full bg-white px-6 py-3 font-bold text-black transition hover:scale-105 hover:bg-zinc-300 md:block"
        >
          Book Event
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="text-3xl text-white md:hidden"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-white/10 bg-black px-6 py-6 md:hidden">
          <div className="flex flex-col gap-5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-lg text-zinc-300 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/booking"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-full bg-white px-6 py-3 text-center font-bold text-black transition hover:bg-zinc-300"
            >
              Book Event
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}