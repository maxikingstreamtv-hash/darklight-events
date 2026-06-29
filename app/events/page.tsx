import EventCard from "@/components/events/EventCard";
import { events } from "@/data/events";



export default function EventsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
          DarkLight Events
        </p>

        <h1 className="mt-4 text-5xl font-black md:text-7xl">
          Vores Events
        </h1>

        <p className="mt-6 max-w-3xl text-gray-400">
          Her kan du se nogle af de events, DarkLight kan planlægge i Dreamlight.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.title} event={event} />
          ))}
        </div>
      </div>
    </main>
  );
}