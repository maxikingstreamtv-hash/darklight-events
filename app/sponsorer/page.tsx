import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

type PublicSponsor = {
  id: string;
  slug: string;
  name: string;
  level: string;
  sponsorType: string;
  isMainSponsor: boolean;
  description: string;
  logoInitials: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  ctaLabel: string | null;
  sortOrder: number;
};

function initials(sponsor: PublicSponsor) {
  return sponsor.logoInitials || sponsor.name.split(" ").map((part) => part[0]).join("").slice(0, 3).toUpperCase();
}

function sortSponsors(a: PublicSponsor, b: PublicSponsor) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, "da");
}

export default async function SponsorerPage() {
  const publicSponsors = await prisma.sponsor.findMany({
    where: { active: true, status: "ACTIVE" },
    select: {
      id: true,
      slug: true,
      name: true,
      level: true,
      sponsorType: true,
      isMainSponsor: true,
      description: true,
      logoInitials: true,
      logoUrl: true,
      websiteUrl: true,
      ctaLabel: true,
      sortOrder: true,
    },
  });

  const mainSponsor = publicSponsors
    .filter((sponsor: PublicSponsor) => sponsor.isMainSponsor || sponsor.sponsorType === "MAIN_SPONSOR")
    .sort(sortSponsors)[0];
  const sponsors = publicSponsors
    .filter((sponsor: PublicSponsor) => sponsor.id !== mainSponsor?.id && sponsor.sponsorType !== "PARTNER")
    .sort(sortSponsors);
  const partners = publicSponsors
    .filter((sponsor: PublicSponsor) => sponsor.id !== mainSponsor?.id && sponsor.sponsorType === "PARTNER")
    .sort(sortSponsors);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-zinc-500">Partnere i DreamLight</p>
          <h1 className="text-5xl font-black md:text-7xl">Sponsorer</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">RP-partnere som støtter DarkLight-events med præmier, crew, lokationer og stemning.</p>

          {publicSponsors.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
              <h2 className="text-3xl font-black">Ingen sponsorer er aktive lige nu</h2>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
                Når DarkLight staff opretter sponsorer i databasen, vises de her. Sponsor-badges på brugere er separat fra sponsorprofiler.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-10">
              {mainSponsor ? <MainSponsorCard sponsor={mainSponsor} /> : null}
              <SponsorSection title="Sponsorer" sponsors={sponsors} />
              <SponsorSection title="Partnere" sponsors={partners} compact />
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function MainSponsorCard({ sponsor }: { sponsor: PublicSponsor }) {
  return (
    <section>
      <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-zinc-500">Hovedsponsor</p>
      <Link href={`/sponsorer/${sponsor.slug}`} className="group grid gap-8 rounded-[2rem] border border-white/15 bg-white/[0.06] p-8 transition hover:-translate-y-1 hover:border-white/40 lg:grid-cols-[220px_1fr] lg:p-10">
        <SponsorLogo sponsor={sponsor} large />
        <div>
          <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">Hovedsponsor</span>
          <h2 className="mt-6 text-4xl font-black md:text-6xl">{sponsor.name}</h2>
          <p className="mt-5 max-w-4xl text-base leading-7 text-zinc-300">{sponsor.description}</p>
          <p className="mt-7 inline-flex rounded-full border border-white/15 px-6 py-3 font-black text-white transition group-hover:bg-white group-hover:text-black">
            {sponsor.ctaLabel || "Se hovedsponsor"}
          </p>
        </div>
      </Link>
    </section>
  );
}

function SponsorSection({ title, sponsors, compact = false }: { title: string; sponsors: PublicSponsor[]; compact?: boolean }) {
  if (sponsors.length === 0) return null;

  return (
    <section>
      <h2 className="text-3xl font-black">{title}</h2>
      <div className={`mt-5 grid gap-5 ${compact ? "md:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        {sponsors.map((sponsor) => (
          <Link key={sponsor.id} href={`/sponsorer/${sponsor.slug}`} className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-white/30">
            <div className="flex items-center gap-4">
              <SponsorLogo sponsor={sponsor} />
              <div>
                <h3 className={compact ? "text-xl font-black" : "text-2xl font-black"}>{sponsor.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{sponsor.level}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-zinc-400">{sponsor.description}</p>
            <p className="mt-5 text-sm font-black transition group-hover:translate-x-1">{sponsor.ctaLabel || "Se sponsor"}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SponsorLogo({ sponsor, large = false }: { sponsor: PublicSponsor; large?: boolean }) {
  const size = large ? "h-44 w-44 text-5xl" : "h-16 w-16 text-xl";

  if (sponsor.logoUrl) {
    return <div className={`flex shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white bg-contain bg-center bg-no-repeat font-black text-black ${size}`} style={{ backgroundImage: `url(${sponsor.logoUrl})` }} aria-label={`${sponsor.name} logo`} />;
  }

  return <div className={`flex shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black font-black text-white ${size}`}>{initials(sponsor)}</div>;
}
