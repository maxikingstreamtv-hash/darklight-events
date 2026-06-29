const items = [
  {
    icon: "🏆",
    title: "Professionelle Events",
    text: "Vi planlægger events med fokus på kvalitet og detaljer.",
  },
  {
    icon: "⚡",
    title: "Hurtig Planlægning",
    text: "Vi sørger for, at dit event bliver planlagt effektivt.",
  },
  {
    icon: "🎭",
    title: "Unikke Oplevelser",
    text: "Hvert event er skræddersyet til dine ønsker.",
  },
  {
    icon: "🤝",
    title: "Erfarent Team",
    text: "Et dedikeret team står klar fra start til slut.",
  },
];

export default function WhyChoose() {
  return (
    <section className="bg-black py-24 px-6 text-white">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-5xl font-black">
          Why Choose DarkLight
        </h2>

        <p className="mt-4 text-center text-gray-400">
          Derfor vælger kunder DarkLight Events.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center hover:border-white/40 transition"
            >
              <div className="text-5xl">
                {item.icon}
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                {item.title}
              </h3>

              <p className="mt-4 text-gray-400">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}