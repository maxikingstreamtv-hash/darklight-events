import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/hero/Hero";
import FeaturedEvents from "@/components/events/FeaturedEvents";
import WhyChoose from "@/components/sections/WhyChoose";
import Stats from "@/components/sections/Stats";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/sections/CTA";
import GalleryPreview from "@/components/sections/GalleryPreview";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
<Navbar />
<Hero />
<FeaturedEvents />
<WhyChoose />
<Stats />
<CTA />
<GalleryPreview />
<Footer />
    </main>
  );
}