import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CreateEventForm from "@/components/competition/CreateEventForm";

export default function CreateEventPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="bg-black px-6 py-28">
        <div className="mx-auto max-w-5xl">
          <CreateEventForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}