export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
            Kontakt
          </p>

          <h1 className="mt-4 text-5xl font-black md:text-7xl">
            Lad os skabe dit næste event
          </h1>

          <p className="mt-6 max-w-2xl text-gray-400">
            Har du en idé, en dato eller bare lyst til at høre mere? Send os en
            forespørgsel, så vender DarkLight Events tilbage.
          </p>

          <div className="mt-10 grid gap-4 text-gray-300">
            <p>📍 Lokation: Dreamlight</p>
            <p>🕒 Åbningstider: Efter aftale</p>
            <p>🎯 Speciale: Events, motorsport, fester og shows</p>
          </div>
        </div>

        <form className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="grid gap-5">
            <input
              className="rounded-xl bg-white/10 px-4 py-4 outline-none"
              placeholder="Dit navn"
            />

            <input
              className="rounded-xl bg-white/10 px-4 py-4 outline-none"
              placeholder="Email eller telefon"
            />

            <input
              className="rounded-xl bg-white/10 px-4 py-4 outline-none"
              placeholder="Hvilket event ønsker du?"
            />

            <textarea
              className="min-h-40 rounded-xl bg-white/10 px-4 py-4 outline-none"
              placeholder="Skriv din besked"
            />

            <button className="rounded-full bg-white px-8 py-4 font-bold text-black transition hover:scale-105">
              Send forespørgsel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}