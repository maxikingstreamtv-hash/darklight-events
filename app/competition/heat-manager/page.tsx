import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HeatManagerPage() {
  const competitions = await prisma.competition.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      event: {
        select: {
          title: true,
          status: true,
        },
      },
      participants: {
        orderBy: [{ createdAt: "asc" }],
      },
      results: true,
    },
  });

  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
              <div>
                <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight EventOS</p>
                <h1 className="text-4xl font-black md:text-6xl">Heat Manager</h1>
                <p className="mt-5 max-w-3xl text-zinc-400">
                  Nuværende database har competitions, participants og results. Dedikerede heats/brackets kræver en senere ikke-destruktiv migration.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-zinc-300">
                PostgreSQL / Prisma
              </div>
            </div>

            <div className="mb-8 grid gap-5 md:grid-cols-3">
              <StatCard title="Konkurrencer" value={competitions.length} text="Databaseposter" />
              <StatCard title="Deltagere" value={competitions.reduce((total, competition) => total + competition.participants.length, 0)} text="På konkurrencer" />
              <StatCard title="Resultater" value={competitions.reduce((total, competition) => total + competition.results.length, 0)} text="Gemte placeringer" />
            </div>

            {competitions.length > 0 ? (
              <div className="grid gap-6 xl:grid-cols-2">
                {competitions.map((competition) => (
                  <article key={competition.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{competition.event.title}</p>
                        <h2 className="mt-3 text-3xl font-black">{competition.title}</h2>
                      </div>
                      <span className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
                        {competition.type}
                      </span>
                    </div>

                    <div className="grid gap-3">
                      <SummaryLine label="Eventstatus" value={competition.event.status} />
                      <SummaryLine label="Deltagere" value={competition.participants.length} />
                      <SummaryLine label="Resultater" value={competition.results.length} />
                    </div>

                    <div className="mt-5 grid gap-3">
                      {competition.participants.map((participant) => (
                        <div key={participant.id} className="rounded-2xl border border-white/10 bg-black p-4">
                          <h3 className="font-black">{participant.name}</h3>
                          <p className="mt-1 text-sm text-zinc-500">{participant.vehicle ?? "Køretøj ikke angivet"}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Database</p>
                <h2 className="mt-4 text-3xl font-black">Ingen konkurrencer endnu</h2>
                <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
                  Heat Manager viser tom-state, indtil konkurrencer og deltagere gemmes i PostgreSQL.
                </p>
              </div>
            )}
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </>
  );
}

function StatCard({ title, value, text }: { title: string; value: string | number; text: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-4xl font-black">{value}</p>
      <p className="mt-3 text-sm text-zinc-400">{text}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black px-4 py-3">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}
