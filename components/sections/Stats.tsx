const stats = [
  { number: "250+", label: "Events planlagt" },
  { number: "1.000+", label: "Gæster samlet" },
  { number: "50+", label: "Race events" },
  { number: "24/7", label: "DarkLight energi" },
];

export default function Stats() {
  return (
    <section className="bg-black px-6 py-24 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center"
          >
            <h3 className="text-5xl font-black">{stat.number}</h3>
            <p className="mt-3 text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}