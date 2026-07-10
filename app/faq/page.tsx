import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

export default async function FAQPage() {
  const faqItems = await prisma.faqItem.findMany({
    where: { active: true, status: "ACTIVE" },
    orderBy: [{ sortOrder: "asc" }, { question: "asc" }],
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">Spørgsmål</p>
          <h1 className="text-5xl font-black md:text-7xl">FAQ</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">Korte svar om DarkLight Events, booking, check-in, resultater og Hall of Fame.</p>
          {faqItems.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
              <h2 className="text-2xl font-black">FAQ er tom</h2>
              <p className="mt-3 text-zinc-400">Når DarkLight staff gemmer aktive FAQ-punkter, vises de her.</p>
            </div>
          ) : (
            <div className="mt-10 space-y-4">
              {faqItems.map((item) => (
                <details key={item.id} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <summary className="cursor-pointer list-none font-black text-white">{item.question}</summary>
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{item.category}</p>
                  {item.note ? <p className="mt-3 text-sm text-zinc-500">{item.note}</p> : null}
                  <p className="mt-4 leading-7 text-zinc-400">{item.answer}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
