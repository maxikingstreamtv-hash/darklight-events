import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    APPROVED: "Godkendt",
    PENDING: "Afventer",
    REJECTED: "Afvist",
    ARCHIVED: "Arkiveret",
  };

  return labels[status] ?? status;
}

export default async function TilladelserPage() {
  const publicPermissions = await prisma.eventPermission.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">Eventkoordinering</p>
          <h1 className="text-5xl font-black md:text-7xl">Tilladelser</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">Overblik over eventtilladelser, lokationer og status i DreamLight.</p>
          {publicPermissions.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
              <h2 className="text-3xl font-black">Ingen tilladelser registreret</h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">Når DarkLight staff gemmer eventtilladelser i databasen, vises de her.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {publicPermissions.map((permission) => (
                <Link key={permission.id} href={`/tilladelser/${permission.slug}`} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-white/30">
                  <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-300">{formatStatus(permission.status)}</span>
                  <h2 className="mt-5 text-2xl font-black">{permission.event}</h2>
                  <p className="mt-3 text-zinc-400">{permission.location}</p>
                  <p className="mt-5 text-sm text-zinc-500">{permission.comment}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
