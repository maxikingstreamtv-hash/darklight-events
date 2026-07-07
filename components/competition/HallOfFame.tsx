"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getActiveVehicle } from "@/components/competition/garage-engine";
import { getLiveLeaderboardRows, type LiveLeaderboardRow } from "@/components/competition/result-engine";
import { useEventOSStore } from "@/components/competition/eventos-store";
import { drivers } from "@/data/drivers";

function getDriverName(driverId: string) {
  return drivers.find((driver) => driver.id === driverId)?.name ?? "Ukendt kører";
}

function getVehicleLabel(driverId: string) {
  const vehicle = getActiveVehicle(driverId);

  return vehicle ? `${vehicle.brand} ${vehicle.model}` : "Ukendt bil";
}

function resultLabel(entry: LiveLeaderboardRow) {
  if (entry.resultType === "time") return `${entry.finalTime?.toFixed(3) ?? "-"}s`;
  if (entry.resultType === "placement") return `P${entry.placement ?? "-"}`;
  return `${entry.score ?? 0} point`;
}

export default function HallOfFame() {
  const { activeEventId, results, hallOfFameWinners, publishHallOfFameWinner } = useEventOSStore();
  const leaderboard = getLiveLeaderboardRows(results).slice(0, 3);

  function publishPlacement(placement: 1 | 2 | 3, driverId?: string) {
    if (!driverId) return;

    publishHallOfFameWinner({
      id: `HOF-${activeEventId}-${placement}`,
      eventId: activeEventId,
      driverId,
      placement,
      publishedBy: "DarkLight Staff",
      publishedAt: new Date().toISOString(),
      notes: "Offentliggjort manuelt fra EventOS Hall of Fame preview.",
    });
  }

  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">Eventkontrol</p>
            <h1 className="text-4xl font-black md:text-6xl">Hall of Fame</h1>
            <p className="mt-5 max-w-2xl text-zinc-400">
              Ren start viser ingen vindere, rekorder eller champions før staff manuelt offentliggør P1, P2 og P3.
            </p>
          </div>

          <Link
            href="/competition"
            className="w-fit rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:border-white hover:bg-white/10"
          >
            Tilbage
          </Link>
        </div>

        <div className="mb-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
          <h2 className="text-3xl font-black">Offentliggør vindere</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Preview bruger godkendte resultater. Knapperne offentliggør først officielle Hall of Fame vindere, når staff er klar.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((placement) => {
              const entry = leaderboard[placement - 1];

              return (
                <div key={placement} className="rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Preview P{placement}</p>
                  <h3 className="mt-3 text-xl font-black">{entry ? getDriverName(entry.driverId) : "Afventer"}</h3>
                  <p className="mt-2 text-sm text-zinc-500">{entry ? resultLabel(entry) : "Ingen godkendte resultater"}</p>
                  <button
                    type="button"
                    disabled={!entry}
                    onClick={() => publishPlacement(placement as 1 | 2 | 3, entry?.driverId)}
                    className="mt-5 w-full rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                  >
                    Offentliggør P{placement}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {hallOfFameWinners.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {hallOfFameWinners.map((winner, index) => (
              <motion.article
                key={winner.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 text-center backdrop-blur-xl"
              >
                <p className="mb-3 text-xs uppercase tracking-[0.35em] text-zinc-500">
                  Offentliggjort P{winner.placement}
                </p>
                <h2 className="text-2xl font-black">{getDriverName(winner.driverId)}</h2>
                <p className="mt-3 text-zinc-400">{winner.eventId}</p>
                <p className="mt-3 rounded-full border border-white/10 bg-black px-4 py-2 text-sm font-black text-zinc-300">
                  {getVehicleLabel(winner.driverId)}
                </p>
                <p className="mt-3 text-xs text-zinc-500">Offentliggjort af {winner.publishedBy}</p>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Ren start</p>
            <h2 className="mt-4 text-3xl font-black">Ingen Hall of Fame vindere endnu</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
              Officiel eventhistorik oprettes først, når DarkLight staff har godkendt resultater og manuelt offentliggjort vindere.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

