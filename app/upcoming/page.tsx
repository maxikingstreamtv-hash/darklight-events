const upcomingEvents = [
  {
    title: "DarkLight Opening Night",
    date: "Dato kommer snart",
    location: "Dreamlight",
    status: "Planlægges",
  },
  {
    title: "Friday Night Drags",
    date: "Dato kommer snart",
    location: "Race Track",
    status: "Åben",
  },
  {
    title: "Summer Beach Party",
    date: "Dato kommer snart",
    location: "Beach",
    status: "Åben",
  },
];

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
          Her kan du se kommende events arrangeret af DarkLight Events.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.title}
              className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-2 hover:border-white/40"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
                {event.status}
              </p>

              <h2 className="mt-4 text-2xl font-black">{event.title}</h2>

              <p className="mt-4 text-gray-400">📅 {event.date}</p>
              <p className="mt-2 text-gray-400">📍 {event.location}</p>

              <a
                href="/booking"
                className="mt-6 inline-block text-sm font-bold text-white/80 hover:text-white"
              >
                Book plads →
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}