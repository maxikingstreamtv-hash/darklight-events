import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HallOfFame from "@/components/competition/HallOfFame";

export default function HallOfFamePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <HallOfFame />
      <Footer />
    </main>
  );
}