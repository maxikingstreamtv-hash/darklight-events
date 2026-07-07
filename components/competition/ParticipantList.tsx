"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { getAvailableDrivers } from "@/components/auth/driver-directory";
import { getActiveVehicle, getDriverVehicles } from "@/components/competition/garage-engine";
import { useEventOSStore } from "@/components/competition/eventos-store";

export default function ParticipantList() {
  const { activeEventId, participants, addParticipant, removeParticipant } = useEventOSStore();
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null);
  const drivers = getAvailableDrivers();
  const activeParticipants = participants.filter((participant) => participant.eventId === activeEventId);
  const availableDrivers = drivers.filter((driver) => !activeParticipants.some((participant) => participant.driverId === driver.id));

  function handleAddParticipant() {
    const driverId = selectedDriverId || availableDrivers[0]?.id;
    if (!driverId) return;
    addParticipant(activeEventId, driverId);
    setSelectedDriverId("");
  }

  function handleRemoveParticipant() {
    if (!participantToRemove) return;
    removeParticipant(participantToRemove, "DarkLight staff");
    setParticipantToRemove(null);
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
            Eventtilmelding
          </p>

          <h2 className="mt-2 text-3xl font-black">Tilmeldte deltagere</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={selectedDriverId} onChange={(event) => setSelectedDriverId(event.target.value)} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none">
            <option value="">Vælg kører</option>
            {availableDrivers.map((driver) => (
              <option key={driver.id} value={driver.id}>{driver.name} · {driver.darklightId}</option>
            ))}
          </select>
          <button type="button" disabled={availableDrivers.length === 0} onClick={handleAddParticipant} className="rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-40">
            + Tilføj deltager
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {activeParticipants.length > 0 ? activeParticipants.map((participant, index) => {
          const driver = drivers.find((d) => d.id === participant.driverId);

          if (!driver) return null;

          const activeVehicle = getActiveVehicle(driver.id);
          const driverVehicles = getDriverVehicles(driver.id);

          return (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="grid gap-5 rounded-2xl border border-white/10 bg-black p-5 xl:grid-cols-[1fr_360px_auto] xl:items-center"
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
                  <p className="text-sm text-zinc-500">{driver.darklightId}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Aktiv bil: {activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model}` : "Ingen bil"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Event-bil</p>
                <p className="mt-2 font-bold">
                  {activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model} · ${activeVehicle.registration}` : driverVehicles.length > 0 ? "Vælg aktiv bil på driverprofilen" : "Ingen bil registreret"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    participant.checkedIn
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {participant.checkedIn ? "Checket ind" : "Afventer check-in"}
                </span>

                <Link
                  href={`/competition/drivers/${driver.id}`}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold transition hover:bg-white hover:text-black"
                >
                  Profil
                </Link>

                <button type="button" onClick={() => setParticipantToRemove(participant.id)} className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500 hover:text-white">
                  Fjern
                </button>
              </div>
            </motion.div>
          );
        }) : (
          <div className="rounded-2xl border border-white/10 bg-black p-6 text-center text-sm font-bold text-zinc-400">
            Ingen deltagere er tilmeldt det aktive event endnu.
          </div>
        )}
      </div>

      {participantToRemove ? (
        <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <p className="font-black text-red-100">Fjern deltager?</p>
          <p className="mt-2 text-sm text-red-100/80">Deltageren fjernes kun fra dette event. Driverprofilen bevares.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={handleRemoveParticipant} className="rounded-full bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400">Bekræft fjern</button>
            <button type="button" onClick={() => setParticipantToRemove(null)} className="rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">Annuller</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
