import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import CompetitionPageShell from "@/components/competition/layout/CompetitionPageShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ControlCenterPage() {
  const [events, participants, results, sponsors, bookings] = await Promise.all([
    prisma.event.findMany({
      orderBy: [{ startsAt: "desc" }],
      include: {
        competitions: {
          select: {
            id: true,
            title: true,
            type: true,
            _count: {
              select: {
                participants: true,
                results: true,
              },
            },
          },
        },
      },
    }),
    prisma.participant.count(),
    prisma.result.count(),
    prisma.sponsor.count({ where: { active: true, status: "ACTIVE" } }),
    prisma.bookingRequest.count(),
  ]);
  const activeEvent = events.find((event) => event.status === "ACTIVE") ?? events[0];

  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <CompetitionPageShell
          eyebrow="DarkLight EventOS"
          title="Eventkontrol"
          subtitle="Fælles databasebaseret kontrolcenter. Alle tal læses fra PostgreSQL, så Cole og Izadora ser samme data."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Events" value={events.length} text="PostgreSQL" />
            <StatCard title="Deltagere" value={participants} text="Alle konkurrencer" />
            <StatCard title="Resultater" value={results} text="Officielle poster" />
            <StatCard title="Sponsorer" value={sponsors} text="Aktive" />
            <StatCard title="Bookinger" value={bookings} text="Forespørgsler" />
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
            <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
              <h2 className="mb-7 text-3xl font-black">Aktuelt event</h2>
              {activeEvent ? (
                <div className="rounded-[2rem] border border-white/10 bg-black p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{activeEvent.status}</p>
                  <h3 className="mt-3 text-4xl font-black">{activeEvent.title}</h3>
                  <p className="mt-4 text-zinc-500">
                    {activeEvent.startsAt.toLocaleString("da-DK")} · {activeEvent.location ?? "Lokation ikke angivet"}
                  </p>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {activeEvent.competitions.map((competition) => (
                      <div key={competition.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{competition.type}</p>
                        <h4 className="mt-2 font-black">{competition.title}</h4>
                        <p className="mt-2 text-sm text-zinc-500">
                          {competition._count.participants} deltagere · {competition._count.results} resultater
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500">Ingen events i databasen endnu.</p>
              )}
            </section>

            <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
              <h2 className="mb-7 text-3xl font-black">DB-moduler</h2>
              <div className="grid gap-3">
                <ControlLink href="/competition/events" text="Events" />
                <ControlLink href="/competition/drivers" text="Deltagere" />
                <ControlLink href="/competition/results" text="Resultater" />
                <ControlLink href="/competition/leaderboard" text="Rangliste" />
                <ControlLink href="/competition/hall-of-fame" text="Hall of Fame" />
                <ControlLink href="/competition/admin" text="Administration" />
              </div>
            </section>
          </div>

          <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7">
            <h2 className="mb-7 text-3xl font-black">Seneste events</h2>
            <div className="grid gap-5 xl:grid-cols-3">
              {events.slice(0, 6).map((event) => (
                <article key={event.id} className="rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{event.status}</p>
                  <h3 className="mt-3 text-2xl font-black">{event.title}</h3>
                  <p className="mt-2 text-sm text-zinc-500">{event.startsAt.toLocaleString("da-DK")}</p>
                  <Link href={`/competition/events`} className="mt-5 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                    Åbn events
                  </Link>
                </article>
              ))}
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

function ControlLink({ href, text }: { href: string; text: string }) {
  return (
    <Link href={href} className="rounded-full border border-white/10 px-5 py-4 text-center font-black text-white transition hover:bg-white hover:text-black">
      {text}
    </Link>
  );
}
