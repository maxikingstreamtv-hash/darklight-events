import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DriversOverview from "@/components/competition/DriversOverview";

export default function DriversPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <DriversOverview />
      <Footer />
    </main>
  );
}
