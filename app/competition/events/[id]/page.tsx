import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventDetails from "@/components/competition/EventDetails";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <EventDetails eventId={id} />
      <Footer />
    </main>
  );
}
