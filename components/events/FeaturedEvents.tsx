"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const featuredEvents = [
  {
    title: "Car Meetup",
    category: "Motorsport",
    image: "/images/events/car-meetup.png",
    description:
      "Et rent biltræf med show cars, præmier, event staff og stærk community-stemning.",
    badges: ["Show Cars", "Præmier", "Community"],
    href: "/events/car-meetup",
  },
  {
    title: "DJ Event",
    category: "Stage Event",
    image: "/images/events/dj-events.png",
    description:
      "Cinematisk stage event med musik, lys, crowd control og en aften byen husker.",
    badges: ["Stage", "Lys", "Crowd Control"],
    href: "/events/dj-events",
  },
  {
    title: "Race Event",
    category: "Motorsport",
    image: "/images/events/races.png",
    description:
      "Kontrolleret race-event med ruteplan, staging, staff og præmier til vinderne.",
    badges: ["Rute", "Event staff", "Præmier"],
    href: "/events/races",
  },
];

export default function FeaturedEvents() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.11),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
            Udvalgte events
          </p>

          <h2 className="text-4xl font-black md:text-6xl">
            Oplevelser med DarkLight kvalitet.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
            Udvalgte eventformater bygget til stemning, struktur og stærke
            øjeblikke i byen.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {featuredEvents.map((event, index) => (
            <motion.article
              key={event.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.1, duration: 0.55 }}
              whileHover={{ y: -10 }}
              className="group relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.02] transition duration-300 hover:border-white/30"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${event.image})` }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/10" />

              <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] backdrop-blur-xl">
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
                    href={event.href}
                    className="rounded-full bg-white px-6 py-3 text-sm font-black text-black shadow-[0_14px_35px_rgba(255,255,255,0.10)] transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300"
                  >
                    Se event
                  </Link>

                  <Link
                    href="/booking"
                    className="rounded-full border border-white/20 bg-black/20 px-6 py-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
                  >
                    Book event
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

