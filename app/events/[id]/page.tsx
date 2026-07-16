import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findFirst({
    where: { slug: id, active: true, public: true },
    select: {
      id: true,
      title: true,
      description: true,
      bannerUrl: true,
      imageAlt: true,
      location: true,
      startsAt: true,
      endsAt: true,
      status: true,
      maxParticipants: true,
      bookings: { select: { id: true } },
      competitions: {
        select: {
          id: true,
          title: true,
          type: true,
          description: true,
          participants: { select: { id: true } },
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const booked = event.bookings.length;
  const available = event.maxParticipants === null ? "Ubegrænset" : Math.max(event.maxParticipants - booked, 0);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <div>
              <div className="mb-5 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-300">{event.status}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-300">{event.competitions[0]?.type ?? "Event"}</span>
              </div>
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Event</p>
              <h1 className="text-5xl font-black md:text-7xl">{event.title}</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">{event.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/events" className="rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                  Alle events
                </Link>
                <Link href="/booking" className="rounded-full bg-white px-6 py-3 font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.10)] transition hover:bg-zinc-300">
                  Book event
                </Link>
              </div>
            </div>
            <div className="group relative h-80 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.4)] md:h-[460px]">
              {event.bannerUrl ? (
                <Image src={event.bannerUrl} alt={event.imageAlt ?? event.title} fill unoptimized className="object-cover opacity-85 transition duration-700 group-hover:scale-105" sizes="(min-width: 1280px) 44vw, 100vw" />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center text-zinc-500">Intet eventbillede</div>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Stat label="Dato" value={formatDate(event.startsAt)} />
            <Stat label="Lokation" value={event.location ?? "Ikke sat"} />
            <Stat label="Ledige pladser" value={available} />
            <Stat label="Tilmeldinger" value={booked} />
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_420px]">
            <Panel title="Eventinfo">
              <InfoLine label="Status" value={event.status} />
              <InfoLine label="Maks deltagere" value={event.maxParticipants ? String(event.maxParticipants) : "Ubegrænset"} />
              <InfoLine label="Slutter" value={event.endsAt ? formatDate(event.endsAt) : "Ikke sat"} />
            </Panel>

            <Panel title="Konkurrencer">
              {event.competitions.length === 0 ? (
                <p className="text-sm text-zinc-500">Ingen konkurrencer er tilknyttet endnu.</p>
              ) : event.competitions.map((competition) => (
                <div key={competition.id} className="rounded-2xl border border-white/10 bg-black p-4">
                  <p className="font-black">{competition.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{competition.type} · {competition.participants.length} deltagere</p>
                </div>
              ))}
            </Panel>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl">
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{label}</p>
      <p className="mt-4 text-2xl font-black">{value}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-right font-black text-zinc-200">{value}</p>
    </div>
  );
}
