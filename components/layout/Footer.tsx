export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">

        <div>
          <h2 className="text-2xl font-black tracking-[0.3em]">
            DARKLIGHT
          </h2>

          <p className="mt-3 text-gray-400">
            Turning Ideas Into Experiences
          </p>
        </div>

        <div className="flex gap-8 text-gray-400">
          <a href="/events" className="hover:text-white">
            Events
          </a>

          <a href="/gallery" className="hover:text-white">
            Galleri
          </a>

          <a href="/booking" className="hover:text-white">
            Booking
          </a>

          <a href="/team" className="hover:text-white">
            Team
          </a>
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} DarkLight Events • Dreamlight RP
      </div>
    </footer>
  );
}