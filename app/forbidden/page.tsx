import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { getAuthSession } from "@/lib/auth/session";
import { getDashboardPath } from "@/lib/auth/rbac";

export default async function ForbiddenPage() {
  const session = await getAuthSession();
  const dashboardHref = session?.user?.role ? getDashboardPath(session.user.role) : "/login";

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="flex min-h-screen items-center justify-center px-6 py-32">
        <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-zinc-500">Adgang afvist</p>
          <h1 className="mt-4 text-4xl font-black">Du har ikke adgang her</h1>
          <p className="mt-4 text-zinc-400">
            Denne del af DarkLight Events kræver en anden rolle eller permission. Badges giver ikke adgang.
          </p>
          <Link href={dashboardHref} className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-black text-black transition hover:bg-zinc-300">
            Tilbage til dashboard
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
