export default function BookingPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
          Booking
        </p>

        <h1 className="mt-4 text-5xl font-black md:text-7xl">
          Book dit event
        </h1>

        <p className="mt-6 text-gray-400">
          Udfyld formularen herunder. Senere kobler vi den på Firebase, så
          bookinger lander direkte i adminpanelet.
        </p>

        <form className="mt-12 grid gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <input className="rounded-xl bg-white/10 px-4 py-4 outline-none" placeholder="Dit navn" />
          <input className="rounded-xl bg-white/10 px-4 py-4 outline-none" placeholder="Discord navn" />
          <input className="rounded-xl bg-white/10 px-4 py-4 outline-none" placeholder="Event type" />
          <input className="rounded-xl bg-white/10 px-4 py-4 outline-none" placeholder="Ønsket dato" />
          <textarea className="min-h-40 rounded-xl bg-white/10 px-4 py-4 outline-none" placeholder="Beskriv dit event" />

          <button className="rounded-full bg-white px-8 py-4 font-bold text-black transition hover:scale-105">
            Send booking
          </button>
        </form>
      </div>
    </main>
  );
}