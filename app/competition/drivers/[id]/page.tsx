"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DriverCareerProfile from "@/components/driver/DriverCareerProfile";
import { drivers } from "@/data/drivers";

export default function DriverProfilePage() {
  const params = useParams<{ id: string }>();
  const driverId = Array.isArray(params.id) ? params.id[0] : params.id;
  const driver = drivers.find((item) => item.id === driverId);

  if (!driver) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <section className="px-6 py-32">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-black">Kører ikke fundet</h1>
            <Link href="/competition/drivers" className="mt-6 inline-flex underline">
              Tilbage til kørere
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="relative overflow-hidden px-6 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl">
          <Link href="/competition/drivers" className="mb-10 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-black text-zinc-300 transition hover:bg-white hover:text-black">
            Tilbage til kørere
          </Link>

          <DriverCareerProfile driver={driver} adminMode />
        </div>
      </section>
      <Footer />
    </main>
  );
}

