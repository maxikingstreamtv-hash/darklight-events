"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Vælg eventtype",
    text: "Start med at vælge hvilken type oplevelse du vil have DarkLight Events til at skabe.",
  },
  {
    number: "02",
    title: "Udfyld detaljer",
    text: "Fortæl os dato, tidspunkt, lokation, gæster og eventuelle ekstra services.",
  },
  {
    number: "03",
    title: "Gennemgå kontrakt",
    text: "Du får en samlet opsummering, så alt er tydeligt før bookingen sendes.",
  },
  {
    number: "04",
    title: "Vi kontakter dig",
    text: "DarkLight Events vender tilbage in-game og aftaler de sidste detaljer.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              Sådan fungerer det
            </p>

            <h2 className="text-4xl font-black md:text-6xl">
              Fra idé til færdigt event.
            </h2>
          </div>

          <p className="max-w-2xl text-zinc-400">
            Vi har gjort bookingflowet simpelt, så du hurtigt kan sende en
            forespørgsel uden at skulle skrive alt fra bunden.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-3xl" />

              <p className="mb-8 text-sm font-black tracking-[0.35em] text-zinc-500">
                {step.number}
              </p>

              <h3 className="text-2xl font-black">{step.title}</h3>

              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl md:p-10">
          <h3 className="text-3xl font-black">
            Klar til at planlægge dit næste event?
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Send en bookingforespørgsel, så tager DarkLight Events kontakt og
            hjælper med at gøre idéen til en RP-oplevelse.
          </p>

          <Link
            href="/booking"
            className="mt-8 inline-flex rounded-full bg-white px-8 py-4 font-black text-black transition hover:scale-105 hover:bg-zinc-300"
          >
            Start booking
          </Link>
        </div>
      </div>
    </section>
  );
}
