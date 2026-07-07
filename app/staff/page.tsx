import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { staffMembers } from "@/data/staff";

export default function StaffPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">DarkLight crew</p>
          <h1 className="text-5xl font-black md:text-7xl">Staff</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">DarkLight Events drives af character staff i DreamLight. Cole Kane og Izadora Solis leder eventorganisationen.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {staffMembers.map((member) => (
              <article key={member.id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-white/30">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black text-xl font-black">{member.initials}</div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{member.department}</p>
                <h2 className="mt-3 text-2xl font-black">{member.characterName}</h2>
                <p className="mt-1 text-sm font-black text-zinc-300">{member.role}</p>
                <p className="mt-5 text-sm text-zinc-500">{member.darklightId} · {member.status}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {member.responsibilities.map((responsibility) => (
                    <span key={responsibility} className="rounded-full border border-white/10 bg-black px-3 py-1 text-xs text-zinc-400">{responsibility}</span>
                  ))}
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

