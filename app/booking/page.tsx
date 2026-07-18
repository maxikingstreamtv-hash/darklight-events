import Link from "next/link";
import BookingExperience from "@/components/booking/BookingExperience";
import Footer from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-black text-white">
      {user ? (
        <BookingExperience initialCharacterName={user.displayName} />
      ) : (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
          <div className="relative mx-auto max-w-2xl rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">DarkLight Booking</p>
            <h1 className="mt-4 text-5xl font-black">Log ind for at fortsætte</h1>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-zinc-400">
              Log ind med din DarkLight-konto, før du sender en booking.
            </p>
            <Link href="/login?callbackUrl=/booking" className="mt-8 inline-flex rounded-full bg-white px-8 py-4 font-black text-black transition hover:bg-zinc-300">
              Log ind
            </Link>
          </div>
        </section>
      )}
      <Footer />
    </main>
  );
}
