const events = [
  "Bryllupper",
  "Beach Party",
  "Pool Party",
  "Firmafester",
  "Privatfester",
  "Drag Race",
  "Drift Events",
  "Car Show",
  "Car Meetup",
  "Awardshow",
  "Fight Night",
  "Rooftop Party",
];

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
            <div
              key={event}
              className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_0_40px_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-2 hover:border-white/40 hover:shadow-[0_0_70px_rgba(255,255,255,0.12)]"
            >
              <div className="mb-6 h-52 rounded-2xl bg-gradient-to-br from-white/30 via-white/10 to-transparent transition duration-500 group-hover:scale-105" />

              <h2 className="text-2xl font-bold">{event}</h2>

              <p className="mt-4 text-sm text-gray-400">
                Professionelt planlagt event med DarkLight-stemning, koordinering
                og eksklusivt setup.
              </p>

              <a
                href="/booking"
                className="mt-6 inline-block text-sm font-bold text-white hover:underline"
              >
                Book dette event →
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}