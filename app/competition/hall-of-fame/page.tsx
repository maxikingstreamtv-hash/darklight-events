import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HallOfFamePage() {
  const winners = await prisma.hallOfFame.findMany({
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    include: {
      event: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <section className="relative overflow-hidden bg-black px-6 py-28 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div>
                <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight EventOS</p>
                <h1 className="text-4xl font-black md:text-6xl">Hall of Fame</h1>
                <p className="mt-5 max-w-3xl text-zinc-400">
                  Officielle vindere læses fra PostgreSQL. Lokale EventOS-vindere bruges ikke længere som runtime-data.
                </p>
              </div>
              <Link href="/hall-of-fame" className="w-fit rounded-full border border-white/15 px-6 py-3 font-black text-zinc-200 transition hover:bg-white hover:text-black">
                Åbn public side
              </Link>
            </div>

            {winners.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {winners.map((winner) => (
                  <article key={winner.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{winner.year}</p>
                    <h2 className="mt-4 text-3xl font-black">{winner.winner}</h2>
                    <p className="mt-3 text-zinc-400">{winner.title}</p>
                    <p className="mt-2 text-sm text-zinc-500">{winner.event.title}</p>
                    {winner.notes ? <p className="mt-4 text-sm leading-6 text-zinc-400">{winner.notes}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Database</p>
                <h2 className="mt-4 text-3xl font-black">Ingen Hall of Fame-poster endnu</h2>
                <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
                  Hall of Fame er tom, indtil officielle vindere gemmes i PostgreSQL.
                </p>
              </div>
            )}
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </>
  );
}
