import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { faqItems } from "@/data/faq";

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">Spørgsmål</p>
          <h1 className="text-5xl font-black md:text-7xl">FAQ</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">Korte svar om DarkLight Events, booking, check-in, resultater og Hall of Fame.</p>
          <div className="mt-10 space-y-4">
            {faqItems.map((item) => (
              <details key={item.id} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <summary className="cursor-pointer list-none font-black text-white">{item.question}</summary>
                <p className="mt-4 leading-7 text-zinc-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

