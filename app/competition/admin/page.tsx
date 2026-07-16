import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompetitionLayout from "@/components/competition/CompetitionLayout";
import AdminDataControl from "@/components/competition/AdminDataControl";
import { FaqManagerPanel, RulesManagerPanel } from "@/components/competition/ContentManagerPanel";
import SponsorDbManagerPanel from "@/components/competition/SponsorDbManagerPanel";
import CompetitionPageShell from "@/components/competition/layout/CompetitionPageShell";
import Badge from "@/components/competition/ui/Badge";
import Button from "@/components/competition/ui/Button";
import Card from "@/components/competition/ui/Card";
import StatCard from "@/components/competition/ui/StatCard";
import { dataModeCopy, eventOSDataMode } from "@/data/eventos-mode";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const modules = [
  ["Eventkontrol", "Online", "/competition/control-center"],
  ["Opret event", "Klar", "/competition/events/create"],
  ["Løbskontrol", "Online", "/competition/race-control"],
  ["Heat Manager", "Klar", "/competition/heat-manager"],
  ["Resultater", "Klar", "/competition/results"],
  ["Check-in", "Klar", "/competition/check-in"],
  ["Rangliste", "Online", "/competition/leaderboard"],
  ["Sæson", "Online", "/competition/seasons"],
  ["Hall of Fame", "Online", "/competition/hall-of-fame"],
  ["Dokumenter", "Klar", "/dokumenter"],
  ["Tilladelser", "Klar", "/tilladelser"],
  ["Sponsorer", "Klar", "/sponsorer"],
];

type AdminSearchParams = {
  resetOk?: string | string[];
  resetError?: string | string[];
  contentOk?: string | string[];
  contentError?: string | string[];
};

function param(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

export default async function CompetitionAdminPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const params = await searchParams;
  const modeCopy = dataModeCopy[eventOSDataMode];
  const currentUser = await getCurrentUser();
  const [faqItems, ruleSets, dbSponsors, staffUsers] = await Promise.all([
    prisma.faqItem.findMany({ orderBy: [{ sortOrder: "asc" }, { question: "asc" }] }),
    prisma.ruleSet.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] }),
    prisma.sponsor.findMany({ orderBy: [{ isMainSponsor: "desc" }, { sponsorType: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }),
    prisma.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"] },
        deletedAt: null,
      },
      orderBy: [{ role: "asc" }, { displayName: "asc" }],
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        active: true,
        profileStatus: true,
      },
    }),
  ]);

  return (
    <>
      <Navbar />
      <CompetitionLayout>
        <CompetitionPageShell
          eyebrow="DarkLight EventOS"
          title="Administration"
          subtitle="Systemstatus, staff-adgang, reset og manuel platformstyring for DarkLight Events."
          actions={<Badge tone="success">Manuelle eventdata</Badge>}
        >
          <div className="grid gap-5 md:grid-cols-3">
            <StatCard title="Systemstatus" value="Online" text="Klar til eventdrift" />
            <StatCard title="Datatilstand" value={modeCopy.title} text="Ren officiel historik" />
            <StatCard title="Styring" value="Manuel" text="Styres af DarkLight staff" />
          </div>

          <Card padded="lg" className="mt-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">Datatilstand</p>
                <h2 className="mt-3 text-3xl font-black">{modeCopy.title}</h2>
                <p className="mt-4 max-w-3xl leading-7 text-zinc-400">{modeCopy.description}</p>
              </div>
              <div className="grid w-full gap-3 rounded-2xl border border-white/10 bg-black p-4 sm:w-[320px]">
                <div className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.04] px-4 py-3">
                  <span className="font-black">Ren start</span>
                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-black text-green-400">Aktiv</span>
                </div>
                <div className="rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-zinc-500">
                  Permanent database kan tilføjes senere.
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-8">
            <AdminDataControl resetOk={param(params.resetOk)} resetError={param(params.resetError)} />
          </div>

          <SponsorDbManagerPanel sponsors={dbSponsors} canDelete={currentUser?.role === "SUPER_ADMIN"} />

          {param(params.contentOk) ? (
            <p className="mt-8 rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-sm font-black text-green-300">
              {param(params.contentOk)}
            </p>
          ) : null}

          {param(params.contentError) ? (
            <p className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm font-black text-red-200">
              {param(params.contentError)}
            </p>
          ) : null}

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <Card padded="lg">
              <h2 className="mb-7 text-3xl font-black">Manuel eventstyring</h2>
              <div className="rounded-2xl border border-white/10 bg-black p-5">
                <p className="font-black">Klar til første officielle event</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Ren start starter uden officielle sejre, podier, champions, afsluttede events eller godkendte resultater.
                  Staff opretter og godkender eventdata under live drift.
                </p>
              </div>
              <div className="mt-5 grid gap-3">
                <Button href="/competition/control-center" variant="primary">Åbn Eventkontrol</Button>
                <Button href="/competition/events/create" variant="secondary">Opret event</Button>
                <Button href="/competition/results" variant="secondary">Åbn Resultater</Button>
              </div>
            </Card>

            <Card padded="lg">
              <h2 className="mb-7 text-3xl font-black">Staff-konti</h2>
              <div className="grid gap-4">
                {staffUsers.map((account) => (
                  <div key={account.id} className="rounded-2xl border border-white/10 bg-black p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{account.role}</p>
                    <h3 className="mt-3 text-xl font-black">{account.displayName}</h3>
                    <p className="mt-2 text-sm text-zinc-500">{account.username}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-300">
                        {account.active ? "Aktiv" : "Inaktiv"}
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-300">
                        {account.profileStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card padded="lg" className="mt-8">
            <h2 className="mb-7 text-3xl font-black">Hurtiglinks</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {modules.map(([title, status, href]) => (
                <Button key={title} href={href} variant="secondary" className="justify-between rounded-2xl px-5 py-4">
                  <span>{title}</span>
                  <span className="text-xs text-green-400">{status}</span>
                </Button>
              ))}
            </div>
          </Card>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <FaqManagerPanel items={faqItems} />
            <RulesManagerPanel items={ruleSets} />
            <Card padded="lg">
              <h2 className="mb-4 text-3xl font-black">Øvrige managers</h2>
              <p className="leading-7 text-zinc-400">
                De gamle localStorage-baserede dokument-, galleri-, nyheds-, staff- og tilladelsesmanagers er fjernet fra runtime.
                Brug de databasebaserede moduler eller opret en Prisma-model, før der tilføjes redigeringsknapper igen.
              </p>
            </Card>
          </div>
        </CompetitionPageShell>
      </CompetitionLayout>
      <Footer />
    </>
  );
}

