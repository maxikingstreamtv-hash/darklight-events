import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { documentCategories, documents } from "@/data/documents";

export default function DokumenterPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <PageHeader label="DarkLight dokumenter" title="Dokumenter" text="Manualer, regler og praktiske papirer til DarkLight Events i DreamLight." />

          <div className="mt-10 flex flex-wrap gap-3">
            {documentCategories.map((category) => (
              <span key={category} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-zinc-300">
                {category}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
              <Link key={document.id} href={`/dokumenter/${document.id}`} className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.07]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{document.category}</p>
                    <h2 className="mt-3 text-2xl font-black">{document.title}</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black text-zinc-300">{document.status}</span>
                </div>
                <p className="mt-5 min-h-14 text-sm leading-6 text-zinc-400">{document.summary}</p>
                <p className="mt-6 text-sm font-black text-white transition group-hover:translate-x-1">Læs dokument</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function PageHeader({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <div>
      <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">{label}</p>
      <h1 className="text-5xl font-black md:text-7xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-zinc-400">{text}</p>
    </div>
  );
}
