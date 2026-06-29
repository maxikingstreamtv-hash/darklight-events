export default function CTA() {
  return (
    <section className="bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.10] via-white/[0.04] to-transparent p-10 text-center shadow-[0_0_70px_rgba(255,255,255,0.08)] md:p-16">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-400">
          Ready?
        </p>

        <h2 className="mt-4 text-4xl font-black md:text-6xl">
          Skal DarkLight planlægge dit næste event?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-gray-300">
          Uanset om du skal bruge bryllup, car meet, drag race, firmafest eller
          et helt unikt event, så hjælper vi med at gøre idéen til virkelighed.
        </p>

        <a
          href="/booking"
          className="mt-10 inline-block rounded-full bg-white px-10 py-4 font-bold text-black transition hover:scale-105"
        >
          Start Booking
        </a>
      </div>
    </section>
  );
}