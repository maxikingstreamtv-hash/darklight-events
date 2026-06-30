"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import EventCategories from "@/components/home/EventCategories";
import FeaturedEvents from "@/components/events/FeaturedEvents";
import HowItWorks from "@/components/home/HowItWorks";
import WhyChoose from "@/components/sections/WhyChoose";
import Stats from "@/components/sections/Stats";

export default function DarkLightHome() {
  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-black px-6 py-32 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:90px_90px] opacity-25" />

        <div className="relative mx-auto flex min-h-[75vh] max-w-7xl flex-col items-center justify-center text-center">
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6 text-sm uppercase tracking-[0.55em] text-zinc-500"
          >
            DarkLight Events
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="max-w-5xl text-5xl font-black leading-tight tracking-tight md:text-7xl lg:text-8xl"
          >
            Vi skaber serverens
            <br />
            <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
              mest unikke events.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400"
          >
            DarkLight Events er en FiveM Roleplay-virksomhed, der planlægger
            eksklusive events med fokus på stemning, struktur og høj RP-kvalitet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/booking"
              className="rounded-full bg-white px-8 py-4 font-black text-black transition hover:scale-105 hover:bg-zinc-300"
            >
              Book dit event
            </Link>

            <Link
              href="/events"
              className="rounded-full border border-white/20 px-8 py-4 font-bold text-white transition hover:border-white hover:bg-white/10"
            >
              Se events
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl">
          <p className="text-sm leading-7 text-zinc-400">
            Denne hjemmeside er lavet til en fiktiv FiveM Roleplay-virksomhed.
            Alle events, personer og aktiviteter er en del af rollespil.
          </p>
        </div>
      </section>

      <EventCategories />
      <FeaturedEvents />
      <HowItWorks />
      <WhyChoose />
      <Stats />

      <section className="bg-black px-6 py-28 text-white">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl md:p-16">
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
            Klar til næste oplevelse?
          </p>

          <h2 className="text-4xl font-black md:text-6xl">
            Lad os bygge dit næste event.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">
            Send en bookingforespørgsel, så tager DarkLight Events kontakt og
            hjælper med at planlægge detaljerne.
          </p>

          <Link
            href="/booking"
            className="mt-8 inline-flex rounded-full bg-white px-8 py-4 font-black text-black transition hover:scale-105 hover:bg-zinc-300"
          >
            Start booking →
          </Link>
        </div>
      </section>
    </>
  );
}