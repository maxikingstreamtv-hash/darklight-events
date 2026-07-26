import PublicEventCard from "@/components/events/PublicEventCard";
import UpcomingEventsEmpty from "@/components/events/UpcomingEventsEmpty";
import { getPublicUpcomingEvents } from "@/lib/events/public-events";

export const dynamic = "force-dynamic";

export default async function UpcomingPage() {
  const events = await getPublicUpcomingEvents();
  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">DLEvents</p>
        <h1 className="mt-4 text-5xl font-black md:text-7xl">Kommende Events</h1>
        <p className="mt-6 max-w-3xl text-gray-400">Se kommende events arrangeret af DarkLight Events.</p>
        <div className="mt-12 grid gap-8">
          {events.length > 0 ? events.map((event) => <PublicEventCard key={event.id} event={event} wide />) : <UpcomingEventsEmpty />}
        </div>
      </div>
    </main>
  );
}
