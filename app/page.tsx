import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/hero/Hero";
import FeaturedEvents from "@/components/events/FeaturedEvents";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <FeaturedEvents />
    </main>
  );
}