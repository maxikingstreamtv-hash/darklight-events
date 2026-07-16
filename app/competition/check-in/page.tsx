import Link from "next/link";
import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  const participants = await prisma.participant.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      competition: {
        select: {
          title: true,
          event: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <CompetitionLayout>
        <section className="relative overflow-hidden px-6 py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />
          <div className="relative mx-auto max-w-7xl">
            <Link href="/competition/control-center" className="mb-10 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-zinc-300 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black">
              Tilbage til Eventkontrol
            </Link>

            <div className="mb-10">
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Events</p>
              <h1 className="text-5xl font-black md:text-7xl">QR Check-in</h1>
              <p className="mt-6 max-w-3xl text-zinc-400">
                Deltageroversigt fra PostgreSQL. Der gemmes ikke længere check-in data i localStorage.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <StatCard title="Deltagere" value={participants.length} />
              <StatCard title="Konkurrencer" value={new Set(participants.map((item) => item.competitionId)).size} />
              <StatCard title="Kilde" value="PostgreSQL" />
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
              <Panel title="Deltagere">
                <div className="grid gap-4">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-black p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.03] md:flex-row md:items-center">
                      <div>
                        <h3 className="text-xl font-black">{participant.name}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{participant.vehicle ?? "Køretøj ikke angivet"}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-zinc-600">
                          {participant.competition.event.title} / {participant.competition.title}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-zinc-300">
                        Databasepost
                      </span>
                    </div>
                  ))}
                  {participants.length === 0 ? <p className="text-zinc-500">Ingen deltagere i databasen endnu.</p> : null}
                </div>
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
        </section>
      </CompetitionLayout>
      <Footer />
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-4xl font-black">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function ControlLink({ text, href }: { text: string; href: string }) {
  return (
    <Link href={href} className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-4 text-center font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black">
      {text}
    </Link>
  );
}
