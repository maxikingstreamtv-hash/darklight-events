import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { news } from "@/data/news";

export default function NyhederPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">DarkLight nyt</p>
          <h1 className="text-5xl font-black md:text-7xl">Nyheder</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">Opdateringer om events, sæsoner, partnere og DarkLight-platformen.</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {news.map((item) => (
              <Link key={item.id} href={`/nyheder/${item.id}`} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-white/30">
                <div className="relative aspect-[16/10]">
                  <Image src={item.image} alt="" fill className="object-cover opacity-80 transition group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{item.category}</p>
                  <h2 className="mt-3 text-2xl font-black">{item.title}</h2>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">{item.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
