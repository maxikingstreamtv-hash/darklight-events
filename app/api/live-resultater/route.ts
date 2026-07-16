import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const competitions = await prisma.competition.findMany({
    include: {
      event: { select: { title: true, slug: true, startsAt: true, status: true } },
      results: {
        orderBy: [{ placement: "asc" }, { createdAt: "desc" }],
        include: { participant: { select: { name: true, vehicle: true, number: true, team: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const sorted = competitions.sort((a, b) => (b.event?.startsAt?.getTime() ?? 0) - (a.event?.startsAt?.getTime() ?? 0));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    competitions: sorted.map((competition) => ({
      id: competition.id,
      title: competition.title,
      type: competition.type,
      event: competition.event,
      results: competition.results.map((result) => ({
        id: result.id,
        placement: result.placement,
        points: result.points,
        notes: result.notes,
        createdAt: result.createdAt,
        participant: result.participant,
      })),
    })),
  });
}
