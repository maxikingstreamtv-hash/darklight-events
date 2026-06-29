const team = [
  {
    name: "Cole Kane",
    role: "Founder & Event Director",
    quote: "Every great event starts with a great vision.",
    responsibilities: ["Eventplanlægning", "Motorsport", "Koordinering", "Ledelse"],
  },
  {
    name: "Izadora Solis",
    role: "Co-Founder & Creative Director",
    quote: "The smallest details create the biggest memories.",
    responsibilities: ["Design", "Dekoration", "Kundeoplevelser", "Planlægning"],
  },
];

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
          DarkLight Team
        </p>

        <h1 className="mt-4 text-5xl font-black md:text-7xl">
          Meet The Team
        </h1>

        <p className="mt-6 max-w-3xl text-gray-400">
          Menneskene bag oplevelserne. DarkLight Events drives af passion,
          kreativitet og ønsket om at skabe events folk husker.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {team.map((member) => (
            <div
              key={member.name}
              className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_0_50px_rgba(255,255,255,0.05)] transition hover:-translate-y-2 hover:border-white/40"
            >
              <div className="mb-8 h-72 rounded-[1.5rem] bg-gradient-to-br from-white/25 via-white/10 to-transparent transition duration-500 group-hover:scale-[1.02]" />

              <h2 className="text-4xl font-black">{member.name}</h2>

              <p className="mt-2 text-sm uppercase tracking-[0.3em] text-gray-500">
                {member.role}
              </p>

              <p className="mt-6 text-lg italic text-gray-300">
                “{member.quote}”
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {member.responsibilities.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}