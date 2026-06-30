import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DragLadder from "@/components/competition/DragLadder";

export default function DragCompetitionPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <DragLadder />
      <Footer />
    </main>
  );
}