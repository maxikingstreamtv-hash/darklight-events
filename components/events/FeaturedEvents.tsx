import Link from "next/link";
import PublicEventCard from "@/components/events/PublicEventCard";
import UpcomingEventsEmpty from "@/components/events/UpcomingEventsEmpty";
import type { PublicUpcomingEvent } from "@/lib/events/public-events";

export default function FeaturedEvents({ events = [] }: { events?: PublicUpcomingEvent[] }) {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.11),transparent_35%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">Kommende events</p>
          <h2 className="text-4xl font-black md:text-6xl">Oplevelser med DarkLight kvalitet.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-zinc-400">De næste offentlige events fra EventOS.</p>
        </div>
        {events.length > 0 ? (
          <>
            <div className="grid gap-8 lg:grid-cols-3">
              {events.map((event) => <PublicEventCard key={event.id} event={event} />)}
            </div>
            <div className="mt-10 text-center">
              <Link href="/upcoming" className="inline-flex rounded-full border border-white/15 px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">Se alle kommende events</Link>
            </div>
          </>
        ) : <UpcomingEventsEmpty />}
      </div>
    </section>
  );
}
