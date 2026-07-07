import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import CreateEventForm from "@/components/competition/CreateEventForm";

export default function CreateEventPage() {
  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <section className="bg-black px-6 py-28 text-white">
          <div className="mx-auto max-w-7xl">
            <CreateEventForm />
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </>
  );
}
