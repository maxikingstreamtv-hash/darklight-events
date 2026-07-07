import Link from "next/link";
import ControlCenterLayout from "@/components/competition/ControlCenterLayout";
import { competitions } from "@/data/competition";

export default function ControlCenterTournamentsPage() {
  return (
    <ControlCenterLayout>
      <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">
            Eventkontrol
          </p>
          <h1 className="text-4xl font-black md:text-6xl">Turneringer</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">
            Samlet adgang til scoreboards, brackets og discipliner i DarkLight Events.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {competitions.map((competition) => {
              const isReady = competition.status === "Klar";
              const content = (
                <>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span className="text-3xl">{competition.icon}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">
                    {competition.status}
                  </span>
                </div>
                <h2 className="text-2xl font-black">{competition.title}</h2>
                <p className="mt-2 text-sm text-zinc-500">{competition.subtitle}</p>
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  {competition.description}
                </p>
                </>
              );

              return isReady ? (
                <Link
                  key={competition.id}
                  href={competition.href}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-white/30"
                >
                  {content}
                </Link>
              ) : (
                <article key={competition.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 opacity-70">
                  {content}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </ControlCenterLayout>
  );
}
