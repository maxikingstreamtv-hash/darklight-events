import Image from "next/image";
import ScrollIndicator from "./ScrollIndicator";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_35%)]" />

      <div className="relative z-10 text-center">
        <Image
          src="/logo.png"
          alt="DarkLight Events"
          width={730}
          height={730}
          priority
          className="mx-auto drop-shadow-[0_0_45px_rgba(255,255,255,0.45)]"
        />

        <p className="mt-6 text-sm tracking-[0.45em] text-gray-400">
          TURNING IDEAS INTO EXPERIENCES
        </p>

        <h1 className="mt-6 text-5xl font-black uppercase tracking-widest md:text-7xl">
          DarkLight Events
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-300">
          Eksklusive events i Dreamlight — fra bryllupper og firmafester til
          drag races, carshows og vilde motorsport-events.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="/booking"
            className="rounded-full bg-white px-8 py-4 font-bold text-black transition hover:scale-105"
          >
            Book Event
          </a>

          <a
            href="/events"
            className="rounded-full border border-white/30 px-8 py-4 font-bold text-white transition hover:bg-white hover:text-black"
          >
            Se Events
          </a>
        </div>
      </div>
    </section>
  );
}