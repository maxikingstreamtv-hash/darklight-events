import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import HallOfFame from "@/components/competition/HallOfFame";

export default function HallOfFamePage() {
  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <HallOfFame />
      </CompetitionLayout>
      <Footer />
    </>
  );
}
