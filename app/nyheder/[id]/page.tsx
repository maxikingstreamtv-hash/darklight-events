import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import { news } from "@/data/news";

export function generateStaticParams() {
  return news.map((item) => ({ id: item.id }));
}

export default async function NyhedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = news.find((entry) => entry.id === id);
  if (!item) notFound();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 py-32">
        <article className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="relative aspect-[16/8]">
            <Image src={item.image} alt="" fill className="object-cover opacity-80" priority />
          </div>
          <div className="p-8">
            <Link href="/nyheder" className="text-sm font-black text-zinc-400 transition hover:text-white">Tilbage til nyheder</Link>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{item.category} · {item.date}</p>
            <h1 className="mt-4 text-5xl font-black">{item.title}</h1>
            <p className="mt-4 text-zinc-400">Af {item.author}</p>
            <div className="mt-8 space-y-4">
              {item.content.map((line) => <p key={line} className="leading-7 text-zinc-300">{line}</p>)}
            </div>
          </div>
        </article>
      </section>
      <Footer />
    </main>
  );
}
