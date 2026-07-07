"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "01",
    label: "Nyt eventfirma",
    text: "DarkLight Events er klar til at skabe de første store oplevelser.",
  },
  {
    value: "24H",
    label: "Typisk svartid",
    text: "Vi bestræber os på at vende tilbage hurtigst muligt efter booking.",
  },
  {
    value: "100%",
    label: "FiveM fokus",
    text: "Alt er bygget til serverens eventmiljø og spilleroplevelser.",
  },
  {
    value: "Uendeligt",
    label: "Eventmuligheder",
    text: "Biltræf, bryllupper, koncerter, racerløb, fester og meget mere.",
  },
];

export default function Stats() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
            DarkLight i tal
          </p>

          <h2 className="text-4xl font-black md:text-6xl">
            Klar til første kapitel.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
            DarkLight Events starter rent og viser ærlige tal, indtil de første
            officielle events er kørt.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl transition duration-300 hover:border-white/25 hover:bg-white/[0.06]"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

              <p className="text-5xl font-black md:text-6xl">{stat.value}</p>
              <h3 className="mt-5 text-xl font-black">{stat.label}</h3>
              <p className="mt-4 text-sm leading-7 text-zinc-400">{stat.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

