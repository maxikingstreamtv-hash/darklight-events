import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/hero/Hero";
import FeaturedEvents from "@/components/events/FeaturedEvents";
import WhyChoose from "@/components/sections/WhyChoose";
import Stats from "@/components/sections/Stats";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

type HomeSponsor = {
  slug: string;
  name: string;
  description: string;
  logoInitials: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  ctaLabel: string | null;
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const mainSponsor = await prisma.sponsor.findFirst({
    where: {
      active: true,
      status: "ACTIVE",
      isMainSponsor: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      description: true,
      logoInitials: true,
      logoUrl: true,
      websiteUrl: true,
      ctaLabel: true,
    },
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero sponsorSlot={mainSponsor ? <HomeMainSponsor sponsor={mainSponsor} /> : null} />
      <FeaturedEvents />
      <WhyChoose />
      <Stats />
      <Footer />
    </main>
  );
}

function HomeMainSponsor({ sponsor }: { sponsor: HomeSponsor }) {
  return (
    <section className="bg-black">
      <div className="mx-auto grid max-w-7xl gap-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] md:grid-cols-[150px_1fr_auto] md:items-center">
        <SponsorLogo sponsor={sponsor} />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">Hovedsponsor</p>
          <h2 className="mt-2 text-2xl font-black md:text-3xl">{sponsor.name}</h2>
          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-zinc-400">{sponsor.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {sponsor.websiteUrl ? (
            <a href={sponsor.websiteUrl} target="_blank" rel="noreferrer" className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-300">
              {sponsor.ctaLabel || "Besøg sponsor"}
            </a>
          ) : null}
          <a href={`/sponsorer/${sponsor.slug}`} className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-zinc-200 transition hover:bg-white hover:text-black">
            Se sponsor
          </a>
        </div>
      </div>
    </section>
  );
}

function SponsorLogo({ sponsor }: { sponsor: HomeSponsor }) {
  if (sponsor.logoUrl) {
    return (
      <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-neutral-950 p-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sponsor.logoUrl} alt={`${sponsor.name} logo`} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-neutral-950 p-1.5 text-2xl font-black text-white">
      {sponsor.logoInitials}
    </div>
  );
}
