import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionHero from "@/components/competition/CompetitionHero";
import CompetitionCard from "@/components/competition/CompetitionCard";
import { competitions } from "@/data/competition";

export default function CompetitionPage() {
  const activeCompetitions = competitions.filter((competition) => competition.status === "Klar");

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <CompetitionHero />

      <section className="bg-black px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm uppercase tracking-[0.45em] text-zinc-500">
                Konkurrencer
              </p>

              <h2 className="text-4xl font-black md:text-5xl">
                Vælg disciplin
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/competition/control-center"
                className="w-fit rounded-full bg-white px-7 py-3 font-black text-black transition hover:bg-zinc-300"
              >
                Åbn Eventkontrol
              </Link>

              <Link
                href="/competition/events/create"
                className="w-fit rounded-full border border-white/15 px-7 py-3 font-black text-white transition hover:border-white/40 hover:bg-white/10"
              >
                + Opret event
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {activeCompetitions.map((competition, index) => (
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
