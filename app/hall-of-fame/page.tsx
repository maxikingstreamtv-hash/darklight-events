import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicHallOfFamePage() {
  const winners = await prisma.hallOfFame.findMany({
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    include: {
      event: {
        select: {
          title: true,
          slug: true,
          startsAt: true,
          active: true,
          public: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight spillerportal</p>
              <h1 className="text-5xl font-black md:text-7xl">Hall of Fame</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">
                Officiel eventhistorik fra PostgreSQL. Vindere vises kun, når de er gemt i Hall of Fame.
              </p>
            </div>
            <Link href="/rangliste" className="w-fit rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 font-black text-zinc-200 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black">
              Se rangliste
            </Link>
          </div>

          {winners.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {winners.map((winner) => (
                <article key={winner.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
                  {winner.imageUrl ? (
                    <div className="aspect-[16/9] bg-zinc-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={winner.imageUrl} alt={winner.title} className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <div className="p-7 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{winner.year}</p>
                    <h2 className="mt-4 text-3xl font-black">{winner.winner}</h2>
                    <p className="mt-3 text-zinc-400">{winner.title}</p>
                    <p className="mt-2 text-sm text-zinc-500">{winner.event.title}</p>
                    {winner.notes ? <p className="mt-4 text-sm leading-6 text-zinc-400">{winner.notes}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Ren start</p>
              <h2 className="mt-4 text-3xl font-black">Ingen officielle vindere endnu</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
                Hall of Fame er tom, indtil DarkLight staff gemmer officielle vindere i databasen.
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
