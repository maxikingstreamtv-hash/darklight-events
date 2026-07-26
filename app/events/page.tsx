import Link from "next/link";
import Footer from "@/components/layout/Footer";
import PublicEventCard from "@/components/events/PublicEventCard";
import UpcomingEventsEmpty from "@/components/events/UpcomingEventsEmpty";
import { getPublicUpcomingEvents } from "@/lib/events/public-events";

export const dynamic = "force-dynamic";

type EventSearchParams = {
  q?: string | string[];
};

function param(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<EventSearchParams> }) {
  const params = await searchParams;
  const query = param(params.q).trim();
  const events = await getPublicUpcomingEvents({ query });

  return (
    <main className="min-h-screen bg-black text-white">
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
            <Link href="/booking" className="inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white px-6 py-3 font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.10)] transition hover:bg-zinc-300">
              Book DarkLight
            </Link>
          </div>

          <form className="mb-8 grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:grid-cols-[1fr_auto]">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Søgning</span>
              <input name="q" defaultValue={query} placeholder="Søg efter event, lokation eller beskrivelse" className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition focus:border-white" />
            </label>
            <button className="inline-flex shrink-0 items-center justify-center self-end whitespace-nowrap rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
              Søg
            </button>
          </form>

          {events.length === 0 ? (
            <UpcomingEventsEmpty />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => <PublicEventCard key={event.id} event={event} />)}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
