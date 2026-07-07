"use client";

import Image from "next/image";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { EVENTOS_ADMIN_GALLERY_STORAGE_KEY } from "@/components/competition/eventos-store";
import { galleryCategories, galleryItems, type GalleryCategory } from "@/data/gallery";

function readGalleryItems() {
  if (typeof window === "undefined") return galleryItems;

  try {
    const stored = JSON.parse(window.localStorage.getItem(EVENTOS_ADMIN_GALLERY_STORAGE_KEY) ?? "null");
    return Array.isArray(stored) ? stored : galleryItems;
  } catch {
    return galleryItems;
  }
}

export default function GalleriPage() {
  const [active, setActive] = useState<GalleryCategory | "Alle">("Alle");
  const publicGalleryItems = readGalleryItems();
  const visibleItems = active === "Alle" ? publicGalleryItems : publicGalleryItems.filter((item) => item.category === active);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">DarkLight moments</p>
          <h1 className="text-5xl font-black md:text-7xl">Galleri</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">Billeder og stemning fra DarkLight Events i DreamLight.</p>

          <div className="mt-10 flex flex-wrap gap-3">
            {(["Alle", ...galleryCategories] as Array<GalleryCategory | "Alle">).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                  active === category ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/30"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-white/30">
                <div className="relative aspect-[16/11]">
                  <Image src={item.image} alt="" fill className="object-cover opacity-85" />
                </div>
                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{item.category}</p>
                  <h2 className="mt-3 text-2xl font-black">{item.title}</h2>
                  <p className="mt-2 text-sm text-zinc-500">{item.eventRef} · {item.date}</p>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

