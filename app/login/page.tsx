"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState, type FormEvent } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function getSafeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const returnTo = getSafeReturnTo(searchParams.get("returnTo"));
    const callbackUrl = returnTo ? `/auth/redirect?returnTo=${encodeURIComponent(returnTo)}` : "/auth/redirect";

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl,
    });

    setPending(false);

    if (!result?.ok) {
      setError("Login mislykkedes. Tjek brugernavn og adgangskode.");
      return;
    }

    router.push(result.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight adgang</p>
            <h1 className="text-5xl font-black md:text-7xl">Log ind</h1>
            <p className="mt-5 max-w-2xl text-zinc-400">
              Log ind med dit DarkLight brugernavn og din adgangskode. Adgang styres af rolle, permissions og badges fra databasen.
            </p>
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="font-black">V2 database-login</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Brugere valideres server-side med PostgreSQL, Prisma og Argon2. Badges er kun visuel status og giver ikke adgang.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.02] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Log ind</p>
            <h2 className="mt-3 text-4xl font-black">DarkLight konto</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Brug dit brugernavn. Email bruges ikke til login i DarkLight Events V2.
            </p>
            <div className="mt-7 grid gap-4">
              <TextInput label="Brugernavn" value={username} onChange={setUsername} autoComplete="username" />
              <TextInput label="Adgangskode" value={password} onChange={setPassword} type="password" autoComplete="current-password" />
              {error ? <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">{error}</p> : null}
              <button
                disabled={pending}
                className="rounded-full bg-white px-6 py-4 font-black text-black transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Logger ind..." : "Log ind"}
              </button>
            </div>
            <Link href="/register" className="mt-4 inline-flex text-sm font-black text-zinc-300 underline underline-offset-4 hover:text-white">
              Opret bruger
            </Link>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function LoginShell() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="flex min-h-screen items-center justify-center px-6 py-32">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-zinc-500">DarkLight adgang</p>
          <h1 className="mt-4 text-4xl font-black">Indlæser login</h1>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="field"
      />
    </label>
  );
}
