const events = [
  "🏁 Drag Race",
  "💍 Bryllupper",
  "🚗 Car Meet",
];

export default function FeaturedEvents() {
  return (
    <section className="bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
          Featured Events
        </p>

        <h2 className="mt-4 text-5xl font-black">
          Oplevelser der bliver husket
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {events.map((event) => (
            <div
              key={event}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-2 hover:border-white/40"
            >
              <div className="mb-6 h-44 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
              <h3 className="text-2xl font-bold">{event}</h3>
              <p className="mt-4 text-gray-400">
                Professionelt DarkLight-event med stil, planlægning og eksklusiv stemning.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}