import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ruleSections } from "@/data/rules";

export default function RegelsaetPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">DarkLight regler</p>
          <h1 className="text-5xl font-black md:text-7xl">Regelsæt</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">Fælles rammer for events, kørere, dommere, crew og publikum i DreamLight.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {ruleSections.map((section) => (
              <article key={section.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                <h2 className="text-2xl font-black">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{section.summary}</p>
                <ul className="mt-5 space-y-3">
                  {section.rules.map((rule) => (
                    <li key={rule} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-300">{rule}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

