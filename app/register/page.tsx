"use client";

import { useMemo, useState, type FormEvent } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { generateNextDarkLightId } from "@/components/auth/darklight-id";
import { REGISTER_STORAGE_KEY, readRegisteredAccounts, type RegisteredAccount } from "@/components/auth/mock-auth";
import { drivers } from "@/data/drivers";

export default function RegisterPage() {
  const [accounts, setAccounts] = useState<RegisteredAccount[]>(() => readRegisteredAccounts());
  const [characterName, setCharacterName] = useState("");
  const [rpPin, setRpPin] = useState("");
  const [accountType, setAccountType] = useState<RegisteredAccount["accountType"]>("Kører");
  const [createdAccount, setCreatedAccount] = useState<RegisteredAccount | null>(null);

  const nextDarkLightId = useMemo(() => generateNextDarkLightId([...drivers, ...accounts]), [accounts]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const account: RegisteredAccount = {
      characterName: characterName.trim(),
      darklightId: nextDarkLightId,
      rpPin,
      accountType,
    };
    const nextAccounts = [account, ...accounts];
    window.localStorage.setItem(REGISTER_STORAGE_KEY, JSON.stringify(nextAccounts));
    setAccounts(nextAccounts);
    setCreatedAccount(account);
    setCharacterName("");
    setRpPin("");
  }

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
              Opret en character-konto. DarkLight ID genereres automatisk og bruges til login.
            </p>
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <p className="font-black">Næste DarkLight ID</p>
              <p className="mt-3 text-4xl font-black">{nextDarkLightId}</p>
              <p className="mt-3 text-sm text-zinc-500">Gem dette ID sammen med din PIN til fremtidigt login.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.02] backdrop-blur-xl">
            <h2 className="text-3xl font-black">Opret bruger</h2>
            <div className="mt-7 grid gap-5">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Character navn</span>
                <input required value={characterName} onChange={(event) => setCharacterName(event.target.value)} className="field" />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">RP PIN</span>
                <input required type="password" value={rpPin} onChange={(event) => setRpPin(event.target.value)} className="field" />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Kontotype</span>
                <select value={accountType} onChange={(event) => setAccountType(event.target.value as RegisteredAccount["accountType"])} className="field">
                  <option>Kører</option>
                  <option>Kunde</option>
                </select>
              </label>
              <button className="rounded-full bg-white px-6 py-4 font-black text-black shadow-[0_18px_45px_rgba(255,255,255,0.10)] transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-300">
                Opret bruger
              </button>
            </div>

            {createdAccount ? (
              <div className="mt-7 rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-green-300">Bruger oprettet</p>
                <p className="mt-2 text-3xl font-black">{createdAccount.darklightId}</p>
                <p className="mt-2 text-sm text-zinc-300">{createdAccount.characterName} kan nu logge ind med dette ID.</p>
              </div>
            ) : null}
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}

