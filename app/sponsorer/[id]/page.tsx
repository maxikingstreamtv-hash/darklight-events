import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

function formatDate(value: Date | null) {
  return value ? new Intl.DateTimeFormat("da-DK", { dateStyle: "medium" }).format(value) : "Ikke sat";
}

function formatSponsorLevel(level: string) {
  const labels: Record<string, string> = {
    PLATINUM: "Platinum",
    GOLD: "Gold",
    SILVER: "Silver",
    PARTNER: "Partner",
  };

  return labels[level] ?? level;
}

function formatSponsorStatus(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Aktiv",
    PENDING: "Afventer",
    ARCHIVED: "Arkiveret",
  };

  return labels[status] ?? status;
}

export default async function SponsorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sponsor = await prisma.sponsor.findFirst({ where: { slug: id, active: true, status: "ACTIVE" } });

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <Link href="/sponsorer" className="text-sm font-black text-zinc-400 transition hover:text-white">Tilbage til sponsorer</Link>
          {sponsor ? (
            <div className="mt-10 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <div className="flex items-center gap-5">
                <SponsorLogo
                  name={sponsor.name}
                  initials={sponsor.logoInitials}
                  logoUrl={sponsor.logoUrl}
                />
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">{formatSponsorLevel(sponsor.level)}</p>
                  <h1 className="text-5xl font-black">{sponsor.name}</h1>
                </div>
              </div>

              <p className="mt-6 leading-7 text-zinc-300">{sponsor.description}</p>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Info label="Kontaktperson" value={sponsor.contactPerson ?? "Ikke sat"} />
                <Info label="Status" value={formatSponsorStatus(sponsor.status)} />
                <Info label="Partner siden" value={formatDate(sponsor.partnerSince)} />
                <Info label="Events" value={sponsor.eventsSupported.length > 0 ? sponsor.eventsSupported.join(", ") : "Ikke sat"} />
              </div>
            </div>
          ) : (
            <div className="mt-10 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
              <h1 className="text-4xl font-black">Sponsor ikke fundet</h1>
              <p className="mt-4 text-zinc-400">Sponsoren findes ikke i den offentlige partnerliste.</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="mt-2 font-black">{value}</p>
    </div>
  );
}

function SponsorLogo({ name, initials, logoUrl }: { name: string; initials: string; logoUrl: string | null }) {
  if (logoUrl) {
    return (
      <div className="flex h-[7.5rem] w-[7.5rem] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-neutral-950 p-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div className="flex h-[7.5rem] w-[7.5rem] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-neutral-950 p-1.5 text-2xl font-black text-white">
      {initials}
    </div>
  );
}
