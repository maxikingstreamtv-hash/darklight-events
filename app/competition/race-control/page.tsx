import Link from "next/link";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import CompetitionPageShell from "@/components/competition/layout/CompetitionPageShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RaceControlPage() {
  const events = await prisma.event.findMany({
    where: { active: true },
    orderBy: [{ startsAt: "desc" }],
    include: {
      competitions: {
        include: {
          participants: true,
          results: true,
        },
      },
    },
  });
  const activeEvent = events.find((event) => event.status === "ACTIVE") ?? events[0];
  const competitions = activeEvent?.competitions ?? [];
  const participants = competitions.flatMap((competition) => competition.participants);
  const results = competitions.flatMap((competition) => competition.results);

  return (
    <>
      <CompetitionLayout>
        <CompetitionPageShell
          eyebrow="DarkLight Race Control"
          title="Løbskontrol"
          subtitle="Databasebaseret kontroloversigt. Gamle lokale heat/start-knapper er fjernet fra runtime, indtil de kan gemme i PostgreSQL."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Aktivt event" value={activeEvent?.title ?? "Ingen"} text="Fra Event-tabellen" />
            <StatCard title="Konkurrencer" value={competitions.length} text="På aktivt event" />
            <StatCard title="Deltagere" value={participants.length} text="På konkurrencer" />
            <StatCard title="Resultater" value={results.length} text="Gemte placeringer" />
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
            <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
              <h2 className="mb-7 text-3xl font-black">Aktivt event</h2>
              {activeEvent ? (
                <div className="rounded-[2rem] border border-white/10 bg-black p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{activeEvent.status}</p>
                  <h3 className="mt-3 text-4xl font-black">{activeEvent.title}</h3>
                  <p className="mt-4 text-zinc-500">
                    {activeEvent.startsAt.toLocaleString("da-DK")} · {activeEvent.location ?? "Lokation ikke angivet"}
                  </p>
                </div>
              ) : (
                <p className="text-zinc-500">Ingen aktive events i databasen.</p>
              )}
            </section>

            <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
              <h2 className="mb-7 text-3xl font-black">DB-handlinger</h2>
              <div className="grid gap-3">
                <ControlLink href="/competition/events" text="Administrer events" />
                <ControlLink href="/competition/drivers" text="Deltagere" />
                <ControlLink href="/competition/results" text="Resultater" />
                <ControlLink href="/live-resultater" text="Public live-resultater" />
              </div>
            </section>
          </div>

          <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
            <h2 className="mb-7 text-3xl font-black">Konkurrencer</h2>
            <div className="grid gap-5 xl:grid-cols-2">
              {competitions.map((competition) => (
                <article key={competition.id} className="rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{competition.type}</p>
                  <h3 className="mt-3 text-2xl font-black">{competition.title}</h3>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <MiniStat label="Deltagere" value={competition.participants.length} />
                    <MiniStat label="Resultater" value={competition.results.length} />
                  </div>
                </article>
              ))}
              {competitions.length === 0 ? <p className="text-zinc-500">Ingen konkurrencer på aktivt event.</p> : null}
            </div>
          </section>
        </CompetitionPageShell>
      </CompetitionLayout>
      <Footer />
    </>
  );
}

function StatCard({ title, value, text }: { title: string; value: string | number; text: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-3xl font-black">{value}</p>
      <p className="mt-3 text-sm text-zinc-400">{text}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function ControlLink({ href, text }: { href: string; text: string }) {
  return (
    <Link href={href} className="rounded-full border border-white/10 px-5 py-4 text-center font-black text-white transition hover:bg-white hover:text-black">
      {text}
    </Link>
  );
}
