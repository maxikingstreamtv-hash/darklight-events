export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-14 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
        <div>
          <h2 className="text-2xl font-black tracking-[0.35em]">
            DARKLIGHT
          </h2>
          <p className="mt-4 max-w-sm text-gray-400">
            Turning Ideas Into Experiences. Premium events i Dreamlight.
          </p>
        </div>

        <div>
          <h3 className="font-bold">Navigation</h3>
          <div className="mt-4 grid gap-3 text-gray-400">
            <a href="/events">Events</a>
            <a href="/booking">Booking</a>
            <a href="/upcoming">Kommende Events</a>
            <a href="/gallery">Galleri</a>
            <a href="/team">Team</a>
            <a href="/contact">Kontakt</a>
          </div>
        </div>

        <div>
          <h3 className="font-bold">Kontakt</h3>
          <div className="mt-4 grid gap-3 text-gray-400">
            <p>📍 Dreamlight</p>
            <p>🕒 Efter aftale</p>
            <p>🎯 Events, shows og motorsport</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-gray-500">
        © {new Date().getFullYear()} DarkLight Events
      </div>
    </footer>
  );
}