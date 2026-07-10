import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { registerUserAction } from "./actions";

type RegisterSearchParams = {
  ok?: string | string[];
  error?: string | string[];
};

function param(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

async function previewNextDarkLightId() {
  const users = await prisma.user.findMany({
    where: { username: { startsWith: "DL-" } },
    select: { username: true },
  });

  const highest = users.reduce((max, user) => {
    const match = /^DL-(\d+)$/.exec(user.username);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `DL-${String(highest + 1).padStart(5, "0")}`;
}

export default async function RegisterPage({ searchParams }: { searchParams: Promise<RegisterSearchParams> }) {
  const params = await searchParams;
  const nextDarkLightId = await previewNextDarkLightId();
  const ok = param(params.ok);
  const error = param(params.error);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative overflow-hidden px-6 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_42%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_440px] lg:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight ID</p>
            <h1 className="mt-4 text-5xl font-black md:text-7xl">Opret bruger</h1>
            <p className="mt-5 max-w-2xl text-zinc-400">
              Opret en character-konto. DarkLight ID genereres automatisk og bruges til login sammen med din DL PIN.
            </p>
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <p className="font-black">Næste DarkLight ID</p>
              <p className="mt-3 text-4xl font-black">{nextDarkLightId}</p>
              <p className="mt-3 text-sm text-zinc-500">Gem dette ID sammen med din PIN til fremtidigt login.</p>
            </div>
          </div>

          <form action={registerUserAction} className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.02] backdrop-blur-xl">
            <h2 className="text-3xl font-black">Opret bruger</h2>
            {error ? <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">{error}</p> : null}
            {ok ? <p className="mt-5 rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-sm text-green-200">{ok}</p> : null}
            <div className="mt-7 grid gap-5">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Character navn</span>
                <input name="displayName" required className="field" />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">DL PIN</span>
                <input name="pin" required type="password" minLength={4} className="field" />
              </label>
              <button className="rounded-full bg-white px-6 py-4 font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.10)] transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300">
                Opret bruger
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}
