import Link from "next/link";
import { getServerSession } from "next-auth";
import Footer from "@/components/layout/Footer";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const [badges, userBadges] = await Promise.all([
    prisma.badge.findMany({
      orderBy: [{ label: "asc" }],
      select: {
        id: true,
        name: true,
        label: true,
        description: true,
        icon: true,
        color: true,
      },
    }),
    userId
      ? prisma.userBadge.findMany({
          where: { userId },
          select: {
            badgeId: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
  ]);
  const unlockedBadgeIds = new Set(userBadges.map((badge) => badge.badgeId));

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight spillerportal</p>
              <h1 className="text-5xl font-black md:text-7xl">Præstationer</h1>
              <p className="mt-5 max-w-3xl text-zinc-400">
                Præstationer vises fra PostgreSQL. Badges er visuel status og giver ikke adgang.
              </p>
            </div>
            <Link href={session ? "/profile" : "/login?callbackUrl=/achievements"} className="w-fit rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 font-black text-zinc-200 transition duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white hover:text-black">
              {session ? "Til profil" : "Log ind"}
            </Link>
          </div>

          <div className="mb-8 grid gap-5 md:grid-cols-3">
            <Stat title="Tildelt" value={unlockedBadgeIds.size} />
            <Stat title="Mulige" value={badges.length} />
            <Stat title="Kilde" value="PostgreSQL" />
          </div>

          {badges.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {badges.map((badge) => {
                const unlocked = unlockedBadgeIds.has(badge.id);

                return (
                  <article key={badge.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{badge.name}</p>
                        <h2 className="mt-3 text-2xl font-black">{badge.label}</h2>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${unlocked ? "bg-green-500/20 text-green-400" : "bg-white/10 text-zinc-400"}`}>
                        {unlocked ? "Tildelt" : "Ikke tildelt"}
                      </span>
                    </div>
                    <p className="min-h-12 text-sm leading-6 text-zinc-400">
                      {badge.description ?? "Visuel DarkLight-status uden adgangsrettigheder."}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Ren start</p>
              <h2 className="mt-4 text-3xl font-black">Ingen præstationer i databasen endnu</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-500">
                Super Admin kan oprette og tildele badges i brugeradministrationen.
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.02] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]">
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-4 text-4xl font-black">{value}</p>
    </div>
  );
}
