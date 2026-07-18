import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DriverProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      badges: {
        include: {
          badge: true,
        },
      },
      permissions: {
        include: {
          permission: true,
        },
      },
      vehicles: {
        orderBy: [{ updatedAt: "desc" }],
        include: {
          inspections: {
            orderBy: [{ createdAt: "desc" }],
            take: 1,
          },
        },
      },
    },
  });

  if (!user || !user.active || user.profileStatus !== "ACTIVE" || user.archivedAt) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <CompetitionLayout>
        <section className="relative overflow-hidden px-6 py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />
          <div className="relative mx-auto max-w-7xl">
            <Link href="/competition/drivers" className="mb-10 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-300 transition hover:bg-white hover:text-black">
              Tilbage til kørere
            </Link>

            <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
              <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  <Avatar avatar={user.avatar ?? ""} displayName={user.displayName} />
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">{user.role}</p>
                    <h1 className="mt-4 text-5xl font-black md:text-7xl">{user.displayName}</h1>
                    <p className="mt-4 text-zinc-500">@{user.username}</p>
                    <p className="mt-1 text-zinc-500">DarkLight ID: {user.darklightId ?? "Ikke tildelt"}</p>
                  </div>
                </div>
                {user.bio ? <p className="mt-6 max-w-3xl leading-7 text-zinc-400">{user.bio}</p> : null}
              </section>

              <aside className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
                <h2 className="text-3xl font-black">Status</h2>
                <div className="mt-6 grid gap-3">
                  <MiniStat label="Aktiv" value={user.active ? "Ja" : "Nej"} />
                  <MiniStat label="Profilstatus" value={user.profileStatus} />
                  <MiniStat label="Køretøjer" value={user.vehicles.length} />
                  <MiniStat label="Badges" value={user.badges.length} />
                </div>
                <Link href={`/admin/users/${user.id}`} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-300">
                  Rediger bruger
                </Link>
              </aside>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-2">
              <Panel title="Badges">
                <div className="flex flex-wrap gap-3">
                  {user.badges.map(({ badge }) => (
                    <span key={badge.id} className="rounded-full border border-white/10 bg-black px-4 py-2 text-sm font-black text-zinc-300">
                      {badge.label}
                    </span>
                  ))}
                  {user.badges.length === 0 ? <p className="text-zinc-500">Ingen badges tildelt.</p> : null}
                </div>
              </Panel>

              <Panel title="Permissions">
                <div className="flex flex-wrap gap-3">
                  {user.permissions.map(({ permission }) => (
                    <span key={permission.id} className="rounded-full border border-white/10 bg-black px-4 py-2 text-sm font-black text-zinc-300">
                      {permission.key}
                    </span>
                  ))}
                  {user.permissions.length === 0 ? <p className="text-zinc-500">Ingen individuelle permissions tildelt.</p> : null}
                </div>
              </Panel>
            </div>

            <Panel title="Køretøjer" className="mt-8">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {user.vehicles.map((vehicle) => (
                  <article key={vehicle.id} className="rounded-2xl border border-white/10 bg-black p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{vehicle.status}</p>
                    <h3 className="mt-3 text-2xl font-black">{vehicle.displayName}</h3>
                    <p className="mt-2 text-sm text-zinc-500">
                      {vehicle.licensePlate ?? "Ingen plade"} · {vehicle.vehicleClass ?? "Ikke angivet"} · {vehicle.eventCategory ?? "Ikke angivet"}
                    </p>
                    <p className="mt-4 text-sm text-zinc-400">
                      Seneste inspektion: {vehicle.inspections[0]?.status ?? "Ingen"}
                    </p>
                  </article>
                ))}
                {user.vehicles.length === 0 ? <p className="text-zinc-500">Ingen køretøjer tildelt.</p> : null}
              </div>
            </Panel>
          </div>
        </section>
      </CompetitionLayout>
      <Footer />
    </main>
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

function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 ${className}`}>
      <h2 className="mb-7 text-3xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function Avatar({ avatar, displayName }: { avatar: string; displayName: string }) {
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  if (avatar) {
    return (
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-neutral-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt={`${displayName} avatar`} className="h-full w-full object-cover" />
      </div>
    );
  }

  return <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-neutral-950 text-3xl font-black text-white">{initials}</div>;
}
