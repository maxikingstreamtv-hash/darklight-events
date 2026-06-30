import { events } from "@/data/events";

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
          Booking
        </p>

        <h1 className="mt-4 text-5xl font-black md:text-7xl">
          Book dit event
        </h1>

        <p className="mt-6 max-w-3xl text-gray-400">
          Udfyld formularen, så vender DarkLight Events tilbage med plan,
          pris og muligheder.
        </p>

        <form className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <input
              className="rounded-xl bg-white/10 px-4 py-4 outline-none"
              placeholder="Dit navn"
            />

            <input
              className="rounded-xl bg-white/10 px-4 py-4 outline-none"
              placeholder="Telefonnummer"
            />

            <select className="rounded-xl bg-white/10 px-4 py-4 outline-none">
              <option>Vælg eventtype</option>
              {events.map((event) => (
                <option key={event.title}>{event.title}</option>
              ))}
            </select>

            <input
              type="date"
              className="rounded-xl bg-white/10 px-4 py-4 outline-none"
            />

            <input
              className="rounded-xl bg-white/10 px-4 py-4 outline-none"
              placeholder="Antal gæster"
            />

            <input
              className="rounded-xl bg-white/10 px-4 py-4 outline-none"
              placeholder="Budget / prisniveau"
            />
          </div>

          <textarea
            className="mt-6 min-h-44 w-full rounded-xl bg-white/10 px-4 py-4 outline-none"
            placeholder="Beskriv dit event, ønsker, lokation, tema osv."
          />

          <button className="mt-8 rounded-full bg-white px-10 py-4 font-bold text-black transition hover:scale-105">
            Send bookingforespørgsel
          </button>
        </form>
      </div>
    </main>
  );
}