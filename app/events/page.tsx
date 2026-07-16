import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type EventSearchParams = {
  q?: string | string[];
};

function param(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function eventState(startsAt: Date, status: string) {
  if (status === "COMPLETED") return "Afsluttet";
  if (status === "ACTIVE") return "Live";
  return startsAt.getTime() < Date.now() ? "Tidligere" : "Kommende";
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<EventSearchParams> }) {
  const params = await searchParams;
  const query = param(params.q).trim();
  const events = await prisma.event.findMany({
    where: {
      active: true,
      public: true,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { location: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      bannerUrl: true,
      thumbnailUrl: true,
      imageAlt: true,
      location: true,
      startsAt: true,
      status: true,
      maxParticipants: true,
      bookings: { select: { id: true } },
      competitions: { select: { type: true, title: true }, take: 1 },
    },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Events</p>
              <h1 className="text-5xl font-black md:text-7xl">Eventkalender</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">
                Den centrale kalender for database-events, tilmeldinger og resultater på DreamLight.
              </p>
            </div>
            <Link href="/booking" className="w-fit rounded-full bg-white px-6 py-3 font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.10)] transition hover:bg-zinc-300">
              Book DarkLight
            </Link>
          </div>

          <form className="mb-8 grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:grid-cols-[1fr_auto]">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Søgning</span>
              <input name="q" defaultValue={query} placeholder="Søg efter event, lokation eller beskrivelse" className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white" />
            </label>
            <button className="self-end rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
              Søg
            </button>
          </form>

          {events.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <h2 className="text-3xl font-black">Ingen offentlige events endnu</h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
                Når DarkLight staff opretter aktive og offentlige events i PostgreSQL, vises de her.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.slug}`} className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-white/30">
                  <div className="relative h-52 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                    {event.thumbnailUrl || event.bannerUrl ? (
                      <Image src={event.thumbnailUrl ?? event.bannerUrl ?? ""} alt={event.imageAlt ?? event.title} fill unoptimized className="object-cover opacity-85 transition duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-500">Intet eventbillede</div>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-zinc-300">{eventState(event.startsAt, event.status)}</span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-zinc-300">{event.competitions[0]?.type ?? "Event"}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-black">{event.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">{event.description}</p>
                  <div className="mt-5 grid gap-2 text-sm text-zinc-500">
                    <p>{formatDate(event.startsAt)}</p>
                    <p>{event.location ?? "Lokation ikke sat"}</p>
                    <p>{event.bookings.length}/{event.maxParticipants ?? "∞"} tilmeldinger</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
