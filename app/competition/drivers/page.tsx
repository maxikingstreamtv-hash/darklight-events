import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import DriversOverview from "@/components/competition/DriversOverview";

export default function DriversPage() {
  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <DriversOverview />
      </CompetitionLayout>
      <Footer />
    </>
  );
}
