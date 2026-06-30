"use client";

import { motion } from "framer-motion";
import { eventCategories } from "@/data/categories";

export default function EventCategories() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.4em] text-zinc-500">
            Hvad vi kan skabe
          </p>

          <h2 className="text-4xl font-black md:text-6xl">
            Events bygget til seriøs roleplay.
          </h2>

          <p className="mt-5 text-zinc-400">
            DarkLight Events hjælper med at gøre idéer til oplevelser på serveren —
            med planlægning, stemning og struktur fra start til slut.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {eventCategories.map((category, index) => (
            <motion.a
              key={category.id}
              href="/booking"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition hover:border-white/40"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/20" />

              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black text-3xl">
                {category.icon}
              </div>

              <h3 className="text-2xl font-black">{category.title}</h3>

              <p className="mt-3 min-h-14 text-sm leading-6 text-zinc-400">
                {category.description}
              </p>

              <div className="mt-6 space-y-3">
                {category.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-black">
                      ✓
                    </span>
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-8 text-sm font-bold text-white">
                Book denne type →
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}