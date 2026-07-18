import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import { documents } from "@/data/documents";

export function generateStaticParams() {
  return documents.map((document) => ({ id: document.id }));
}

export default async function DokumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = documents.find((item) => item.id === id);

  if (!document) notFound();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 py-32">
        <article className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <Link href="/dokumenter" className="text-sm font-black text-zinc-400 transition hover:text-white">Tilbage til dokumenter</Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{document.category}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-zinc-300">{document.status}</span>
          </div>
          <h1 className="mt-6 text-5xl font-black">{document.title}</h1>
          <p className="mt-4 text-zinc-400">{document.summary}</p>
          <div className="mt-8 grid gap-3 text-sm text-zinc-400 sm:grid-cols-3">
            <p>Opdateret: {document.updatedAt}</p>
            <p>Ejer: {document.owner}</p>
            <p>Synlighed: {document.visibility}</p>
          </div>
          <div className="mt-10 space-y-4">
            {document.content.map((line) => (
              <p key={line} className="rounded-2xl border border-white/10 bg-black/60 p-5 leading-7 text-zinc-300">{line}</p>
            ))}
          </div>
        </article>
      </section>
      <Footer />
    </main>
  );
}
