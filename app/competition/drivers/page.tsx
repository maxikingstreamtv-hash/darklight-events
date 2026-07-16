import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: [{ displayName: "asc" }],
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      active: true,
      profileStatus: true,
      _count: {
        select: {
          vehicles: true,
          badges: true,
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
            <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">Eventkontrol</p>
                <h1 className="text-4xl font-black md:text-6xl">DarkLight ID oversigt</h1>
                <p className="mt-5 max-w-2xl text-zinc-400">
                  Profiler hentes fra PostgreSQL. Hardcoded profiler som runtime-data bruges ikke længere.
                </p>
              </div>
              <Link href="/admin/users/create" className="w-fit rounded-full bg-white px-6 py-3 font-bold text-black transition hover:bg-zinc-300">
                Opret bruger
              </Link>
            </div>

            {users.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {users.map((user) => (
                  <article key={user.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{user.role}</p>
                    <h2 className="mt-3 text-2xl font-black">{user.displayName}</h2>
                    <p className="mt-2 text-sm text-zinc-500">{user.username}</p>
                    <div className="mt-5 grid gap-3">
                      <MiniStat label="Status" value={user.active ? user.profileStatus : "INACTIVE"} />
                      <MiniStat label="Køretøjer" value={user._count.vehicles} />
                      <MiniStat label="Badges" value={user._count.badges} />
                    </div>
                    <Link href={`/competition/drivers/${user.id}`} className="mt-5 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
                      Åbn profil
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Database</p>
                <h2 className="mt-4 text-3xl font-black">Ingen brugere endnu</h2>
                <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">Opret brugere i adminpanelet for at vise DarkLight ID-oversigten.</p>
              </div>
            )}
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black px-4 py-3">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}
