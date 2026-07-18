import Footer from "@/components/layout/Footer";
import LiveResultsClient from "@/components/live-results/LiveResultsClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getPayload() {
  const competitions = await prisma.competition.findMany({
    include: {
      event: { select: { id: true, title: true, startsAt: true, status: true } },
      results: {
        orderBy: [{ placement: "asc" }, { createdAt: "desc" }],
        include: { participant: { select: { name: true, vehicle: true, number: true, team: true } } },
      },
      heats: {
        orderBy: [{ round: "asc" }, { heatNumber: "asc" }],
        include: { entries: { orderBy: { startPosition: "asc" }, include: { participant: { select: { name: true, vehicle: true, number: true } } } } },
      },
      brackets: {
        include: {
          matches: {
            orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
            include: {
              participantA: { select: { name: true, number: true } },
              participantB: { select: { name: true, number: true } },
              winner: { select: { name: true, number: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const announcements = await prisma.eventAnnouncement.findMany({
    where: { status: "PUBLISHED", event: { active: true } },
    orderBy: { publishedAt: "desc" },
    take: 6,
    include: { event: { select: { id: true, title: true } } },
  });

  return {
    generatedAt: new Date().toISOString(),
    announcements,
    competitions: competitions
      .sort((a, b) => (b.event?.startsAt?.getTime() ?? 0) - (a.event?.startsAt?.getTime() ?? 0))
      .map((competition) => ({
        id: competition.id,
        title: competition.title,
        type: competition.type,
        event: competition.event ? { ...competition.event, startsAt: competition.event.startsAt.toISOString() } : null,
        results: competition.results.map((result) => ({
          id: result.id,
          placement: result.placement,
          points: result.points,
          participant: result.participant,
        })),
        heats: competition.heats.map((heat) => ({
          id: heat.id,
          title: heat.title,
          status: heat.status,
          entries: heat.entries.map((entry) => ({
            startPosition: entry.startPosition,
            participant: entry.participant,
          })),
        })),
        matches: competition.brackets.flatMap((bracket) => bracket.matches).map((match) => ({
          id: match.id,
          round: match.round,
          matchNumber: match.matchNumber,
          status: match.status,
          participantA: match.participantA,
          participantB: match.participantB,
          winner: match.winner,
        })),
      })),
  };
}

export default async function LiveResultaterPage() {
  const payload = await getPayload();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-sm uppercase tracking-[0.45em] text-zinc-500">DarkLight Events</p>
          <h1 className="text-5xl font-black md:text-7xl">Live resultater</h1>
          <p className="mt-5 max-w-3xl text-zinc-400">
            Officielle resultater fra PostgreSQL. Siden poller APIet uden fuld page refresh.
          </p>
          <div className="mt-10">
            <LiveResultsClient initialPayload={payload} />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
