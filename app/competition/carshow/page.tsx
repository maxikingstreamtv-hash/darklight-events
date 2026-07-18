import Footer from "@/components/layout/Footer";
import CarShowScoring from "@/components/competition/CarShowScoring";

export default function CarShowCompetitionPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <CarShowScoring />
      <Footer />
    </main>
  );
}
