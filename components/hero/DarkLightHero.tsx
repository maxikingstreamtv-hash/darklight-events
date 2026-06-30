"use client";

import { motion } from "framer-motion";

export default function DarkLightHero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black px-6 py-32 text-white">
      {/* Baggrund */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />

      <div className="relative mx-auto flex min-h-[75vh] max-w-7xl flex-col items-center justify-center text-center">
        {/* Overskrift over titlen */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-5 text-sm uppercase tracking-[0.55em] text-zinc-500"
        >
          FiveM Roleplay Event Company
        </motion.p>

        {/* Hovedtitel */}
        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl"
        >
          Creating unforgettable
          <br />

          <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Roleplay Experiences
          </span>
        </motion.h1>

        {/* Beskrivelse */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400"
        >
          DarkLight Events planlægger eksklusive FiveM-events med fokus på
          stemning, struktur og høj RP-kvalitet — fra biltræf og racerløb til
          bryllupper, koncerter og private arrangementer.
        </motion.p>

        {/* Knapper */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <a
            href="/booking"
            className="rounded-full bg-white px-8 py-4 font-black text-black transition duration-300 hover:scale-105 hover:bg-zinc-300"
          >
            Book dit event
          </a>

          <a
            href="/events"
            className="rounded-full border border-white/20 px-8 py-4 font-bold text-white transition duration-300 hover:border-white hover:bg-white/10"
          >
            Udforsk events
          </a>
        </motion.div>

        {/* Info-kort */}
        <div className="mt-16 grid w-full max-w-4xl gap-4 md:grid-cols-3">
          {[
            ["01", "Skræddersyet RP"],
            ["02", "Premium eventflow"],
            ["03", "Klar til opstart"],
          ].map(([number, text], index) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.6 + index * 0.15,
                duration: 0.7,
              }}
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition"
            >
              <p className="text-sm text-zinc-500">{number}</p>

              <p className="mt-2 text-lg font-bold">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}