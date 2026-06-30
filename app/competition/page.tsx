import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionHero from "@/components/competition/CompetitionHero";
import CompetitionCard from "@/components/competition/CompetitionCard";
import { competitions } from "@/data/competition";

export default function CompetitionPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <CompetitionHero />

      <section className="bg-black px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
              Vælg disciplin
            </p>

            <h2 className="text-4xl font-black md:text-6xl">
              Competition Center
            </h2>

            <p className="mt-4 max-w-2xl text-zinc-400">
              Her finder du alle DarkLight Events konkurrencer. Vælg en disciplin
              for at se turneringer, leaderboards eller bedømmelser.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {competitions.map((competition, index) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}