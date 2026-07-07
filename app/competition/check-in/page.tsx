"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import Link from "next/link";
import { useEventOSStore } from "@/components/competition/eventos-store";
import Tooltip from "@/components/competition/ui/Tooltip";
import { drivers } from "@/data/drivers";

export default function CheckInPage() {
  const { participants, events } = useEventOSStore();
  const checkedIn = participants.filter((p) => p.checkedIn).length;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <CompetitionLayout>
      <section className="relative overflow-hidden px-6 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/competition/control-center"
            className="mb-10 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-zinc-300 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black"
          >
            Tilbage til Eventkontrol
          </Link>

          <div className="mb-10">
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              DarkLight Events
            </p>

            <h1 className="text-5xl font-black md:text-7xl">QR Check-in</h1>

            <p className="mt-6 max-w-3xl text-zinc-400">
              Digitalt check-in system til DarkLight Events. Bruges til at holde
              styr på deltagere, adgang og eventstatus.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <StatCard title="Deltagere" value={participants.length} />
            <StatCard title="Checket ind" value={checkedIn} />
            <StatCard title="Afventer" value={participants.length - checkedIn} />
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
            <Panel title="Deltager check-in">
              <div className="grid gap-4">
                {participants.map((participant) => {
                  const driver = drivers.find((item) => item.id === participant.driverId);
                  const event = events.find((item) => item.id === participant.eventId);

                  if (!driver) return null;

                  return (
                    <div
                      key={participant.id}
                      className="flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-black p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.03] md:flex-row md:items-center"
                    >
                      <div>
                        <h3 className="text-xl font-black">{driver.name}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{driver.darklightId}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-zinc-600">
                          {event?.title ?? "Ukendt event"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <span
                          className={`rounded-full px-4 py-2 text-sm font-black ${
                            participant.checkedIn
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {participant.checkedIn ? "✓ Checket ind" : "Afventer"}
                        </span>

                        <Tooltip text="Åbner deltagerens driverprofil og DarkLight ID.">
                          <Link
                            href={`/competition/drivers/${driver.id}`}
                            className="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black"
                          >
                            Åbn ID
                          </Link>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <div className="grid gap-8">
              <Panel title="Scanner">
                <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-white/10 bg-black p-8">
                  <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-3">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <div
                        key={index}
                        className={`rounded-xl border border-white/10 ${
                          index % 2 === 0 ? "bg-white" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="mt-5 text-center text-sm text-zinc-500">
                  Check-in oversigt til staff. Brug deltagerlisten til ID-kontrol.
                </p>
              </Panel>

              <Panel title="Staff-kontrol">
                <div className="grid gap-4">
                  <ControlLink text="Åbn Eventkontrol" href="/competition/control-center" />
                  <ControlLink text="Deltageroversigt" href="/competition/drivers" />
                  <ControlLink text="Resultater" href="/competition/results" />
                  <ControlLink text="Livecenter" href="/competition/live-center" />
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </section>

      </CompetitionLayout>
      <Footer />
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-4xl font-black">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl">
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function ControlLink({ text, href }: { text: string; href: string }) {
  return (
    <Tooltip text={`Åbner ${text.toLowerCase()} i EventOS.`}>
      <Link href={href} className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-4 text-center font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black">
        {text}
      </Link>
    </Tooltip>
  );
}


