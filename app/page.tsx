import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/hero/Hero";
import FeaturedEvents from "@/components/events/FeaturedEvents";
import WhyChoose from "@/components/sections/WhyChoose";
import Stats from "@/components/sections/Stats";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <Hero />

      {/* FiveM Disclaimer */}
      <section className="bg-black px-6 pb-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-center">
          <h2 className="mb-2 text-lg font-bold text-yellow-300">
            ⚠️ Bemærk
          </h2>

          <p className="text-sm leading-7 text-gray-300">
            Denne hjemmeside er udviklet til{" "}
            <span className="font-bold text-white">
              DarkLight Events
            </span>
            , en fiktiv virksomhed på en{" "}
            <span className="font-bold text-white">
              FiveM Roleplay-server
            </span>
            . Alle events, virksomheder, personer og aktiviteter er en del af
            et rollespil og har ingen relation til en virkelig virksomhed.
          </p>
        </div>
      </section>

      <FeaturedEvents />
      <WhyChoose />
      <Stats />
      <Footer />
    </main>
  );
}