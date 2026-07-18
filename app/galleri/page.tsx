import Image from "next/image";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

export default async function GalleriPage() {
  const publicGalleryItems = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
    include: { event: { select: { title: true } } },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">DarkLight moments</p>
          <h1 className="text-5xl font-black md:text-7xl">Galleri</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">Billeder og stemning fra DarkLight Events i DreamLight.</p>

          {publicGalleryItems.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
              <h2 className="text-3xl font-black">Galleriet er tomt</h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">Når DarkLight staff gemmer billeder i databasen, vises de her.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {publicGalleryItems.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-white/30">
                  <div className="relative aspect-[16/11]">
                    <Image src={item.imageUrl} alt="" fill className="object-cover opacity-85" />
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{item.event?.title ?? "DarkLight"}</p>
                    <h2 className="mt-3 text-2xl font-black">{item.title}</h2>
                    <p className="mt-2 text-sm text-zinc-500">{item.photographer ?? "DarkLight staff"}</p>
                    <p className="mt-4 text-sm leading-6 text-zinc-400">{item.description ?? "Ingen beskrivelse."}</p>
                  </div>
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
