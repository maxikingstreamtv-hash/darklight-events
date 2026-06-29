export default function Navbar() {
  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="font-black tracking-[0.35em]">
          DARKLIGHT
        </a>

        <div className="hidden gap-8 text-sm text-gray-300 md:flex">
          <a href="/events">Events</a>
          <a href="/booking">Booking</a>
          <a href="/dragrace">Drag Race</a>
          <a href="/gallery">Galleri</a>
          <a href="/team">Team</a>
        </div>

        <a
          href="/login"
          className="rounded-full border border-white/30 px-5 py-2 text-sm hover:bg-white hover:text-black"
        >
          Login
        </a>
      </div>
    </nav>
  );
}