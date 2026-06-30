"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const featuredEvents = [
  {
    title: "Biltræf",
    category: "Motorsport",
    image: "/images/events/car-meet.jpg",
    description:
      "Stilrent biltræf med show cars, præmier, eventpersonale og en stærk community-stemning.",
    badges: ["Show Cars", "Præmier", "Community"],
  },
  {
    title: "Koncert",
    category: "Sceneevent",
    image: "/images/events/concert.jpg",
    description:
      "Cinematic sceneevent med musik, lys, crowd control og en oplevelse serveren husker.",
    badges: ["Scene", "Lys", "Crowd Control"],
  },
  {
    title: "Racerløb",
    category: "Motorsport",
    image: "/images/events/race.jpg",
    description:
      "Kontrolleret race-event med rute, startområde, dommere og præmier til vinderne.",
    badges: ["Rute", "Dommere", "Præmier"],
  },
];

export default function FeaturedEvents() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.11),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
            Udvalgte Events
          </p>

          <h2 className="text-4xl font-black md:text-6xl">
            Oplevelser med DarkLight-kvalitet.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
            Et udvalg af de eventtyper vi kan arrangere på serveren — bygget
            til seriøs roleplay, stemning og fællesskab.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {featuredEvents.map((event, index) => (
            <motion.article
              key={event.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.7 }}
              whileHover={{ y: -10 }}
              className="group relative min-h-[520px] overflow-hidden rounded-[2.2rem] border border-white/10 bg-zinc-950 shadow-2xl"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${event.image})` }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/10" />

              <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] backdrop-blur-xl">
                {event.category}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-7">
                <h3 className="text-4xl font-black">{event.title}</h3>

                <p className="mt-4 text-sm leading-7 text-zinc-300">
                  {event.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {event.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-zinc-200 backdrop-blur-xl"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/booking"
                    className="rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-zinc-300"
                  >
                    Book Event →
                  </Link>

                  <Link
                    href="/events"
                    className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
                  >
                    Læs mere
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}