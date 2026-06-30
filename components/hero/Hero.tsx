import Image from "next/image";
import ScrollIndicator from "./ScrollIndicator";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">

      {/* Baggrund */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_40%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px] opacity-25" />

      <div className="relative z-10 mx-auto max-w-6xl text-center">

        {/* Logo */}
        <Image
          src="/logo.png"
          alt="DarkLight Events"
          width={430}
          height={430}
          priority
          className="mx-auto drop-shadow-[0_0_50px_rgba(255,255,255,0.35)]"
        />

        {/* Slogan */}
        <p className="mt-8 text-sm uppercase tracking-[0.55em] text-zinc-500">
          TURNING IDEAS INTO EXPERIENCES
        </p>

        {/* Overskrift */}
        <h1 className="mt-8 text-3xl font-black leading-tight md:text-5xl xl:text-6xl">
          Vi skaber Dreamlights
          <br />
          <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            mest unikke events.
          </span>
        </h1>

        {/* Beskrivelse */}
        <p className="mx-auto mt-8 max-w-4xl text-lg leading-8 text-zinc-300 md:text-xl">
          DarkLight Events er Dreamlights professionelle eventvirksomhed.
          Vi planlægger alt fra biltræf, drift-turneringer, drag races og
          carshows til bryllupper, firmafester og store community-events –
          altid med fokus på kvalitet, struktur og uforglemmelige oplevelser.
        </p>

        {/* Knapper */}
        <div className="mt-12 flex flex-col justify-center gap-5 sm:flex-row">

          <a
            href="/booking"
            className="rounded-full bg-white px-10 py-4 font-black text-black transition duration-300 hover:scale-105 hover:bg-zinc-300"
          >
            Book dit event
          </a>

          <a
            href="/events"
            className="rounded-full border border-white/20 px-10 py-4 font-black text-white transition duration-300 hover:bg-white hover:text-black"
          >
            Se events
          </a>

        </div>

        {/* Statistik */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-5 md:grid-cols-4">

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
            <h3 className="text-4xl font-black">10+</h3>
            <p className="mt-3 text-sm text-zinc-500">
              Eventtyper
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
            <h3 className="text-4xl font-black">100%</h3>
            <p className="mt-3 text-sm text-zinc-500">
              FiveM Roleplay
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
            <h3 className="text-4xl font-black">24H</h3>
            <p className="mt-3 text-sm text-zinc-500">
              Typisk svartid
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
            <h3 className="text-4xl font-black">∞</h3>
            <p className="mt-3 text-sm text-zinc-500">
              Muligheder
            </p>
          </div>

        </div>

      </div>

      <ScrollIndicator />

    </section>
  );
}