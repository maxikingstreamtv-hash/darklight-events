import Navbar from "@/components/layout/Navbar";
import DarkLightHome from "@/components/home/DarkLightHome";
import Footer from "@/components/layout/Footer";
import BackgroundGlow from "@/components/shared/BackgroundGlow";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <BackgroundGlow />
      <Navbar />
      <DarkLightHome />
      <Footer />
    </main>
  );
}