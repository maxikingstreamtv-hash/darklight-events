"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  clearMockSession,
  createSessionFromRegisteredAccount,
  findRegisteredAccount,
  findStaffAccount,
  founderAccount,
  isFounderLogin,
  saveMockSession,
  staffAccounts,
  type MockSession,
} from "@/components/auth/mock-auth";
import { useMockSession } from "@/components/auth/use-mock-session";

const roles = ["Founder", "Co-Founder", "DarkLight Events Admin", "Event Manager", "Dommer", "Check-in staff", "Kører"];

export default function LoginPage() {
  const [characterName, setCharacterName] = useState(founderAccount.characterName);
  const [darklightId, setDarklightId] = useState(founderAccount.darklightId);
  const [rpPin, setRpPin] = useState(founderAccount.rpPin);
  const storedSession = useMockSession();
  const [localSession, setLocalSession] = useState<MockSession | null>(null);
  const session = localSession ?? storedSession;
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const staffAccount = findStaffAccount(characterName, darklightId, rpPin);
    const registeredAccount = findRegisteredAccount(characterName, darklightId, rpPin);

    if (!isFounderLogin(characterName, darklightId, rpPin) && !registeredAccount) {
      setError("Login matcher ikke en kendt DarkLight-konto.");
      return;
    }

    const nextSession: MockSession = registeredAccount
      ? createSessionFromRegisteredAccount(registeredAccount, remember)
      : {
          characterName: staffAccount?.characterName ?? founderAccount.characterName,
          darklightId: staffAccount?.darklightId ?? founderAccount.darklightId,
          roles: staffAccount?.roles ?? founderAccount.roles,
          remembered: remember,
        };

    saveMockSession(nextSession, remember);
    setLocalSession(nextSession);
  }

  function handleLogout() {
    clearMockSession();
    setLocalSession(null);
    setError("");
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
              Log ind med din character-konto. Cole Kane og Izadora Solis har fuld EventOS-adgang som DarkLight Events staff.
            </p>
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <p className="font-black">EventOS adgang</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Staff-værktøjer er til DarkLight staff-konti. Spillere kan bruge booking, profil og eventsider.
              </p>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.02] backdrop-blur-xl">
            {session ? (
              <>
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Logget ind som</p>
                <h2 className="mt-3 text-4xl font-black">{session.characterName}</h2>
                <p className="mt-2 text-zinc-400">{session.darklightId}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {session.roles.map((role) => (
                    <span key={role} className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-300">
                      {role}
                    </span>
                  ))}
                </div>
                <div className="mt-8 grid gap-3">
                  <Link href="/competition/control-center" className="inline-flex justify-center rounded-full bg-white px-6 py-4 font-black text-black transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300">
                    Åbn EventOS
                  </Link>
                  <button onClick={handleLogout} className="rounded-full border border-white/15 px-6 py-4 font-black text-white transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-black">
                    Log ud
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleLogin}>
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Log ind</p>
                <h2 className="mt-3 text-4xl font-black">DarkLight ID</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Brug dit character navn, DarkLight ID og RP PIN.
                </p>
                <div className="mt-7 grid gap-4">
                  <TextInput label="Character navn" value={characterName} onChange={setCharacterName} />
                  <TextInput label="DarkLight ID" value={darklightId} onChange={setDarklightId} />
                  <TextInput label="RP PIN" value={rpPin} onChange={setRpPin} type="password" />
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black px-5 py-4 text-sm text-zinc-300">
                    <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 accent-white" />
                    Husk mig
                  </label>
                  {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">{error}</p>}
                  <button className="rounded-full bg-white px-6 py-4 font-black text-black transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300">Log ind</button>
                </div>
                <div className="mt-5 grid gap-2 text-xs text-zinc-500">
                  {staffAccounts.map((account) => (
                    <p key={account.darklightId}>{account.characterName}: {account.darklightId} / PIN {account.rpPin}</p>
                  ))}
                </div>
                <Link href="/register" className="mt-4 inline-flex text-sm font-black text-zinc-300 underline underline-offset-4 hover:text-white">
                  Opret bruger
                </Link>
              </form>
            )}
            <div className="mt-8 rounded-2xl border border-white/10 bg-black p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Roller</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {roles.map((role) => <span key={role} className="rounded-full bg-white/[0.06] px-3 py-2 text-xs text-zinc-300">{role}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function TextInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="field" />
    </label>
  );
}

