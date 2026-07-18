import Link from "next/link";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventsManagerPage() {
  const events = await prisma.event.findMany({
    orderBy: [{ sortOrder: "asc" }, { startsAt: "desc" }, { title: "asc" }],
    include: {
      _count: {
        select: {
          competitions: true,
          registrations: true,
          gallery: true,
        },
      },
    },
  });

  return (
    <>
      <CompetitionLayout>
        <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight EventOS</p>
                <h1 className="text-4xl font-black md:text-6xl">Events</h1>
                <p className="mt-5 max-w-3xl text-zinc-400">
                  Event Manager læser nu direkte fra PostgreSQL. Ingen events hentes fra den gamle EventOS-store.
                </p>
              </div>
              <Link href="/competition/events/create" className="w-fit rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
                Opret event
              </Link>
            </div>

            {events.length > 0 ? (
              <div className="grid gap-6 xl:grid-cols-2">
                {events.map((event) => (
                  <article key={event.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{event.status}</p>
                        <h2 className="mt-3 text-3xl font-black">{event.title}</h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-500">{event.description}</p>
                      </div>
                      <span className={`w-fit rounded-full px-4 py-2 text-sm font-black ${event.active && event.public ? "bg-green-500/10 text-green-400" : "bg-zinc-500/10 text-zinc-400"}`}>
                        {event.active && event.public ? "Public" : "Skjult"}
                      </span>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <MiniStat label="Dato" value={event.startsAt.toLocaleDateString("da-DK")} />
                      <MiniStat label="Konkurrencer" value={event._count.competitions} />
                      <MiniStat label="Tilmeldinger" value={event._count.registrations} />
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Link href={`/competition/events/${event.id}`} className="inline-flex min-w-32 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                        Åbn event
                      </Link>
                      <Link href={`/events/${event.id}`} className="inline-flex min-w-28 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                        Public
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Database</p>
                <h2 className="mt-4 text-3xl font-black">Ingen events endnu</h2>
                <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
                  Opret første event, så det gemmes i PostgreSQL og bliver synligt for alle admins.
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

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}
