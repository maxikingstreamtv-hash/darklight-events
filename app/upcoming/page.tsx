import Image from "next/image";
import { upcomingEvents } from "@/data/upcoming-events";

export default function UpcomingPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
          DLEvents
        </p>

        <h1 className="mt-4 text-5xl font-black md:text-7xl">
          Kommende Events
        </h1>

        <p className="mt-6 max-w-3xl text-gray-400">
          Se kommende events arrangeret af DarkLight Events.
        </p>

        <div className="mt-12 grid gap-8">
          {upcomingEvents.map((event) => (
            <div
              key={event.title}
              className="group grid overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_0_50px_rgba(255,255,255,0.05)] transition hover:-translate-y-1 hover:border-white/40 md:grid-cols-2"
            >
              <Image
                src={event.image}
                alt={event.title}
                width={1000}
                height={600}
                className="h-80 w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="flex flex-col justify-center p-8 md:p-10">
                <p className="text-sm uppercase tracking-[0.35em] text-gray-500">
                  {event.status}
                </p>

                <h2 className="mt-4 text-4xl font-black">{event.title}</h2>

                <p className="mt-6 text-gray-400">{event.date}</p>
                <p className="mt-2 text-gray-400">Lokation: {event.location}</p>

                <a
                  href="/booking"
                  className="mt-8 inline-block w-fit rounded-full bg-white px-8 py-4 font-bold text-black transition hover:scale-105"
                >
                  Book plads
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
