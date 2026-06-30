import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventDetails from "@/components/competition/EventDetails";

export default function EventDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <EventDetails eventId={params.id} />
      <Footer />
    </main>
  );
}