import Image from "next/image";

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
  "Miss Dreamlight",
  "Fight Night",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-black/70 px-8 py-4 backdrop-blur-xl">
        <div className="font-bold tracking-[0.35em] text-white">
          DARKLIGHT
        </div>

        <div className="hidden gap-8 text-sm text-gray-300 md:flex">
          <a href="#events">Events</a>
          <a href="#dragrace">Drag Race</a>
          <a href="#booking">Booking</a>
          <a href="#contact">Kontakt</a>
        </div>

        <button className="rounded-full border border-white/30 px-5 py-2 text-sm hover:bg-white hover:text-black">
          Login
        </button>
      </nav>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_35%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />

        <div className="relative z-10">
          <Image
            src="/logo.png"
            alt="DarkLight Events Logo"
            width={430}
            height={430}
            priority
            className="mx-auto drop-shadow-[0_0_35px_rgba(255,255,255,0.35)]"
          />

          <p className="mt-6 tracking-[0.45em] text-gray-400">
            TURNING IDEAS INTO EXPERIENCES
          </p>

          <h1 className="mt-6 text-5xl font-black uppercase tracking-widest md:text-7xl">
            DarkLight Events
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-300">
            Vi skaber eksklusive events i Dreamlight – fra bryllupper og
            firmafester til drag races, carshows, awardshows og vilde
            motorsport-events.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#booking"
              className="rounded-full bg-white px-8 py-4 font-bold text-black transition hover:scale-105"
            >
              Book Event
            </a>

            <a
              href="#events"
              className="rounded-full border border-white/30 px-8 py-4 font-bold text-white transition hover:bg-white hover:text-black"
            >
              Se Events
            </a>
          </div>
        </div>
      </section>

      <section id="events" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
            Hvad tilbyder vi?
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Events med stil, lyd, lys og attitude
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <div
                key={event}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_30px_rgba(255,255,255,0.05)] transition hover:-translate-y-2 hover:border-white/40"
              >
                <div className="mb-8 h-32 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                <h3 className="text-xl font-bold">{event}</h3>
                <p className="mt-3 text-sm text-gray-400">
                  Professionelt planlagt event med DarkLight-stemning,
                  koordinering og eksklusivt setup.
                </p>
                <p className="mt-5 text-sm font-bold text-gray-300">
                  Pris kan redigeres senere
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="dragrace" className="border-y border-white/10 bg-white/[0.03] px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
              Drag Race Center
            </p>
            <h2 className="mt-4 text-4xl font-black">
              Leaderboard & turneringer
            </h2>
            <p className="mt-6 text-gray-300">
              Her kommer scoreboard, 2v2 brackets, finaler og vindere.
              Senere gør vi det redigerbart fra adminpanelet.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black p-6">
            <div className="grid grid-cols-3 border-b border-white/10 pb-3 text-sm text-gray-400">
              <span>Placering</span>
              <span>Navn</span>
              <span>Tid</span>
            </div>

            {["Cole Kane", "Izadora Solis", "Alex Corleone"].map((name, i) => (
              <div key={name} className="grid grid-cols-3 border-b border-white/10 py-4">
                <span>#{i + 1}</span>
                <span>{name}</span>
                <span>{(7.8 + i / 10).toFixed(2)}s</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="booking" className="px-6 py-24 text-center">
        <h2 className="text-4xl font-black">Klar til at booke et event?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-400">
          Booking-systemet kommer i næste version. Her kan kunder senere logge
          ind, bestille events og se status.
        </p>

        <button className="mt-8 rounded-full bg-white px-10 py-4 font-bold text-black">
          Booking kommer snart
        </button>
      </section>

      <footer id="contact" className="border-t border-white/10 px-6 py-10 text-center text-gray-500">
        © DarkLight Events — Dreamlight RP
      </footer>
    </main>
  );
}
