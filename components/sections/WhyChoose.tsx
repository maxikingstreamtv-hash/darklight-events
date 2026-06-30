"use client";

import { motion } from "framer-motion";

const reasons = [
  {
    number: "01",
    title: "Planlagt fra start",
    text: "Vi hjælper med at gøre idéen konkret, så eventet får struktur, flow og et klart formål.",
  },
  {
    number: "02",
    title: "Bygget til RP",
    text: "Alt er lavet til FiveM Roleplay — ikke som en almindelig virksomhedsservice.",
  },
  {
    number: "03",
    title: "Stemning og detaljer",
    text: "Vi fokuserer på lokation, timing, roller, præsentation og den oplevelse deltagerne husker.",
  },
  {
    number: "04",
    title: "Klar til vækst",
    text: "DarkLight Events er bygget til at kunne vokse med serveren og udvikle større events over tid.",
  },
];

export default function WhyChoose() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.12),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              Hvorfor DarkLight?
            </p>

            <h2 className="text-4xl font-black md:text-6xl">
              Mere end bare et event.
            </h2>
          </div>

          <p className="max-w-2xl text-zinc-400">
            DarkLight Events handler ikke kun om at samle folk. Det handler om
            at skabe scener, øjeblikke og oplevelser, som giver serveren mere
            liv og bedre roleplay.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.number}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
            >
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />

              <p className="mb-8 text-sm font-black tracking-[0.35em] text-zinc-500">
                {reason.number}
              </p>

              <h3 className="text-2xl font-black">{reason.title}</h3>

              <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">
                {reason.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}