const items = ["Drag Race", "Car Meets", "Bryllupper", "Awardshows"];

export default function GalleryPreview() {
  return (
    <section className="bg-black px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
          Gallery
        </p>

        <h2 className="mt-4 text-5xl font-black">
          Se stemningen fra vores events
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {items.map((item) => (
            <div
              key={item}
              className="group h-72 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/20 via-white/5 to-transparent p-6 transition hover:-translate-y-2 hover:border-white/40"
            >
              <div className="flex h-full items-end">
                <h3 className="text-2xl font-black">{item}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}