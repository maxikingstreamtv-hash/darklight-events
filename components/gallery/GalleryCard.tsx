import Image from "next/image";

type GalleryCardProps = {
  image: string;
  title: string;
  category: string;
};

export default function GalleryCard({
  image,
  title,
  category,
}: GalleryCardProps) {
  return (
    <div className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-2 hover:border-white/40">
      <div className="relative overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={900}
          height={600}
          className="h-72 w-full object-cover transition duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute bottom-0 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-300">
            {category}
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}