import GalleryCard from "@/components/gallery/GalleryCard";
import { gallery } from "@/data/gallery";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
          DarkLight Gallery
        </p>

        <h1 className="mt-4 text-5xl font-black md:text-7xl">
          Galleri
        </h1>

        <p className="mt-6 max-w-3xl text-gray-400">
          Se stemningen fra vores events, shows, fester og motorsport.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item) => (
            <GalleryCard
              key={item.title}
              image={item.image}
              title={item.title}
              category={item.category}
            />
          ))}
        </div>
      </div>
    </main>
  );
}