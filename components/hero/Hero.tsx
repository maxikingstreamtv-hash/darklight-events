import Image from "next/image";
import ScrollIndicator from "./ScrollIndicator";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030303] px-6 text-white">
<div className="absolute inset-0 overflow-hidden">

  <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-[140px]" />

  <div className="absolute left-[12%] top-[18%] h-1 w-1 rounded-full bg-white opacity-70 animate-pulse" />

  <div className="absolute right-[20%] top-[28%] h-1.5 w-1.5 rounded-full bg-white opacity-50 animate-pulse" />

  <div className="absolute left-[30%] bottom-[25%] h-1 w-1 rounded-full bg-white opacity-60 animate-pulse" />

  <div className="absolute right-[15%] bottom-[18%] h-2 w-2 rounded-full bg-white opacity-40 animate-pulse" />

  <div className="absolute left-[75%] top-[55%] h-1 w-1 rounded-full bg-white opacity-50 animate-pulse" />

</div>

      <div className="relative z-10 text-center animate-fade-in">
        <Image
          src="/logo.png"
          alt="DarkLight Events"
          width={750}
          height={750}
          priority
          className="mx-auto drop-shadow-[0_0_70px_rgba(255,255,255,0.35)] transition duration-700 hover:scale-105"
        />

        <p className="mt-6 text-sm tracking-[0.45em] text-gray-400">
          TURNING IDEAS INTO EXPERIENCES
        </p>

        <h1 className="mt-8 text-5xl font-black uppercase tracking-[0.22em] text-white md:text-8xl">
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