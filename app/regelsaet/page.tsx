import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

export default async function RegelsaetPage() {
  const ruleSections = await prisma.ruleSet.findMany({
    where: { active: true, status: "ACTIVE" },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">DarkLight regler</p>
          <h1 className="text-5xl font-black md:text-7xl">Regelsæt</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">Fælles rammer for events, kørere, dommere, crew og publikum i DreamLight.</p>
          {ruleSections.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
              <h2 className="text-3xl font-black">Regelsættet er tomt</h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">Når DarkLight staff gemmer aktive regler, vises de her.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {ruleSections.map((section) => (
                <article key={section.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                  <h2 className="text-2xl font-black">{section.title}</h2>
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{section.category}</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{section.summary}</p>
                  <ul className="mt-5 space-y-3">
                    {section.rules.map((rule) => (
                      <li key={rule} className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-zinc-300">{rule}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
