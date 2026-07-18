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
    where: {
      OR: [
        { darklightId: { startsWith: "DL-" } },
        { username: { startsWith: "DL-" } },
      ],
    },
    select: { username: true, darklightId: true },
  });

  const highest = users.reduce((max, user) => {
    const value = user.darklightId ?? user.username;
    const match = /^DL-(\d+)$/.exec(value);
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
      <section className="relative overflow-hidden px-6 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_42%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_440px] lg:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight konto</p>
            <h1 className="mt-4 text-5xl font-black md:text-7xl">Opret bruger</h1>
            <p className="mt-5 max-w-2xl text-zinc-400">
              Gem dit brugernavn og din DL PIN. Det er dem, du bruger næste gang, du logger ind.
            </p>
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <p className="font-black">Næste DarkLight ID</p>
              <p className="mt-3 text-4xl font-black">{nextDarkLightId}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                DarkLight ID genereres automatisk efter oprettelse og vises på din profil. Det bruges ikke som login.
              </p>
            </div>
          </div>

          <form action={registerUserAction} className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.02] backdrop-blur-xl">
            <h2 className="text-3xl font-black">Opret bruger</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Brugernavn bruges til login. Visningsnavn er det navn andre ser i DarkLight-systemet.
            </p>
            {error ? <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">{error}</p> : null}
            {ok ? <p className="mt-5 rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-sm text-green-200">{ok}</p> : null}
            <div className="mt-7 grid gap-5">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Brugernavn</span>
                <input name="username" required minLength={3} placeholder="Fx ColeKane" autoComplete="username" className="field" />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Visningsnavn / karakternavn</span>
                <input name="displayName" required minLength={2} placeholder="Fx Cole Kane" className="field" />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">DL PIN</span>
                <input name="pin" required type="password" minLength={4} placeholder="Vælg din DL PIN" autoComplete="new-password" className="field" />
              </label>
              <p className="text-sm leading-6 text-zinc-500">
                Fremtidigt login: brugernavn + DL PIN. Din PIN vises ikke igen efter oprettelse.
              </p>
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
