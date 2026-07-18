import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const sorted = competitions.sort((a, b) => (b.event?.startsAt?.getTime() ?? 0) - (a.event?.startsAt?.getTime() ?? 0));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    announcements,
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
  });
}
