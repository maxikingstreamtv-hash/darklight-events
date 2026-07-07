import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import EventManager from "@/components/competition/EventManager";

export default function EventsManagerPage() {
  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <EventManager />
      </CompetitionLayout>
      <Footer />
    </>
  );
}
