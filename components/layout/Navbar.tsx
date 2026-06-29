"use client";

import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/events", label: "Events" },
    { href: "/booking", label: "Booking" },
    { href: "/upcoming", label: "Kommende Events" },
    { href: "/gallery", label: "Galleri" },
    { href: "/team", label: "Team" },
    { href: "/contact", label: "Kontakt" },
  ];

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="font-black tracking-[0.35em]">
          DARKLIGHT
        </a>

        <div className="hidden gap-8 text-sm text-gray-300 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="/login"
          className="hidden rounded-full border border-white/30 px-5 py-2 text-sm hover:bg-white hover:text-black md:block"
        >
          Login
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="text-3xl md:hidden"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black px-6 py-6 md:hidden">
          <div className="flex flex-col gap-5 text-gray-300">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-lg hover:text-white"
              >
                {link.label}
              </a>
            ))}

            <a
              href="/login"
              className="mt-4 rounded-full border border-white/30 px-5 py-3 text-center hover:bg-white hover:text-black"
            >
              Login
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}