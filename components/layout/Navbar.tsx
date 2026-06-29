export default function Navbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="text-sm font-black uppercase tracking-[0.45em] text-white">
          DarkLight
        </a>

        <nav className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
          <a href="/events" className="transition hover:text-white">Events</a>
          <a href="/booking" className="transition hover:text-white">Booking</a>
          <a href="/dragrace" className="transition hover:text-white">Drag Race</a>
          <a href="/gallery" className="transition hover:text-white">Galleri</a>
          <a href="/team" className="transition hover:text-white">Team</a>
        </nav>

        <a
          href="/login"
          className="rounded-full border border-white/20 px-5 py-2 text-sm text-white transition hover:border-white hover:bg-white hover:text-black"
        >
          Login
        </a>
      </div>
    </header>
  );
}