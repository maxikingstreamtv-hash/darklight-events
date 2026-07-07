"use client";

import Link from "next/link";
import BookingExperience from "@/components/booking/BookingExperience";
import { useMockSession } from "@/components/auth/use-mock-session";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function BookingPage() {
  const session = useMockSession();

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      {session ? (
        <BookingExperience initialCharacterName={session.characterName} />
      ) : (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
          <div className="relative mx-auto max-w-2xl rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">DarkLight Booking</p>
            <h1 className="mt-4 text-5xl font-black">Log ind for at fortsætte</h1>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-zinc-400">
              Log ind med din character-konto, før du sender en booking.
            </p>
            <Link href="/login" className="mt-8 inline-flex rounded-full bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-300">
              Log ind
            </Link>
          </div>
        </section>
      )}
      <Footer />
    </main>
  );
}

