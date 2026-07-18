import Footer from "@/components/layout/Footer";
import DriftBracket from "@/components/competition/DriftBracket";

export default function DriftCompetitionPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <DriftBracket />
      <Footer />
    </main>
  );
}
