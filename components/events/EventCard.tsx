import Image from "next/image";

type Event = {
  title: string;
  image: string;
  category: string;
  description: string;
};

type EventCardProps = {
  event: Event;
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_0_40px_rgba(255,255,255,0.04)] transition duration-300 hover:-translate-y-2 hover:border-white/40 hover:shadow-[0_0_70px_rgba(255,255,255,0.12)]">
      <div className="relative overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          width={800}
          height={500}
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-xl">
          {event.category}
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-black">{event.title}</h2>

        <p className="mt-4 text-sm leading-6 text-gray-400">
          {event.description}
        </p>

        <a
          href="/booking"
          className="mt-6 inline-block text-sm font-bold text-white/80 transition hover:text-white"
        >
          Book dette event →
        </a>
      </div>
    </div>
  );
}