import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      competitions: {
        include: {
          participants: true,
          results: true,
        },
      },
      _count: {
        select: {
          bookings: true,
          gallery: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <CompetitionLayout>
        <section className="relative overflow-hidden px-6 py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative mx-auto max-w-7xl">
            <Link href="/competition/events" className="mb-10 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-300 transition hover:bg-white hover:text-black">
              Tilbage til events
            </Link>

            <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
              <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">{event.status}</p>
                <h1 className="mt-4 text-5xl font-black md:text-7xl">{event.title}</h1>
                <p className="mt-6 max-w-3xl leading-7 text-zinc-400">{event.description}</p>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <MiniStat label="Dato" value={event.startsAt.toLocaleString("da-DK")} />
                  <MiniStat label="Lokation" value={event.location ?? "Ikke angivet"} />
                  <MiniStat label="Public" value={event.public && event.active ? "Ja" : "Nej"} />
                </div>
              </section>

              <aside className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
                <h2 className="text-3xl font-black">Status</h2>
                <div className="mt-6 grid gap-3">
                  <MiniStat label="Konkurrencer" value={event.competitions.length} />
                  <MiniStat label="Bookinger" value={event._count.bookings} />
                  <MiniStat label="Galleri" value={event._count.gallery} />
                </div>
                <Link href={`/events/${event.slug}`} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">
                  Åbn public event
                </Link>
              </aside>
            </div>

            <section className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <h2 className="mb-7 text-3xl font-black">Konkurrencer</h2>
              <div className="grid gap-5 xl:grid-cols-2">
                {event.competitions.map((competition) => (
                  <article key={competition.id} className="rounded-2xl border border-white/10 bg-black p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{competition.type}</p>
                    <h3 className="mt-3 text-2xl font-black">{competition.title}</h3>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <MiniStat label="Deltagere" value={competition.participants.length} />
                      <MiniStat label="Resultater" value={competition.results.length} />
                    </div>
                  </article>
                ))}
                {event.competitions.length === 0 ? <p className="text-zinc-500">Ingen konkurrencer knyttet til eventet endnu.</p> : null}
              </div>
            </section>
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </main>
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
