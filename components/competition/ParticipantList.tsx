"use client";

import { motion } from "framer-motion";
import { participants } from "@/data/participants";
import { drivers } from "@/data/drivers";

export default function ParticipantList() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
            Deltagere
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Tilmeldte deltagere
          </h2>
        </div>

        <button className="rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">
          + Tilføj deltager
        </button>
      </div>

      <div className="space-y-4">
        {participants.map((participant, index) => {
          const driver = drivers.find(
            (d) => d.id === participant.driverId
          );

          if (!driver) return null;

          return (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 font-black">
                  {driver.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>

                <div>
                  <h3 className="font-black">{driver.name}</h3>

                  <p className="text-sm text-zinc-500">
                    {driver.darklightId}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    participant.checkedIn
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {participant.checkedIn
                    ? "✓ Checket ind"
                    : "Afventer check-in"}
                </span>

                <button className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold transition hover:bg-white hover:text-black">
                  Profil
                </button>

                <button className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500 hover:text-white">
                  Fjern
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}