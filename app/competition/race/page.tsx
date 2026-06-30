import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RaceLeaderboard from "@/components/competition/RaceLeaderboard";

export default function RaceCompetitionPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <RaceLeaderboard />
      <Footer />
    </main>
  );
}